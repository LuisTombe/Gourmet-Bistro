import 'dotenv/config';
import express from 'express';
import { z } from 'zod';
import {
  poolFor,
  requireRole,
  internalOnly,
  internalFetch,
  asyncRoute,
  apiError,
  namedLocks,
  baseUrl,
  otelTraceMiddleware,
  compressionAndCacheMiddleware,
  getServiceMetrics,
  cacheGet,
  cacheSet,
  cacheInvalidatePrefix,
  enqueueJob,
} from '../shared/infra.mjs';
import { ALL_STATES, transitionAllowed, calcLines } from '../shared/domain.mjs';

const db = poolFor('pedidos');
const app = express();
app.disable('x-powered-by');
app.use(otelTraceMiddleware('ms-pedidos'));
app.use(compressionAndCacheMiddleware);
app.use(express.json({ limit: '32kb' }));

const createSchema = z
  .object({
    id_mesa: z.number().int().positive(),
    items: z
      .array(
        z
          .object({
            id_producto: z.number().int().positive(),
            cantidad: z.number().int().positive(),
          })
          .strict()
      )
      .min(1)
      .max(50),
    total_confirmado: z.number().finite().positive(),
  })
  .strict();

const statusSchema = z.object({ estado: z.enum(ALL_STATES) }).strict();
const catalogUrl = () => baseUrl('CATALOG_URL', 'http://127.0.0.1:4002');
const parseId = (req) => z.coerce.number().int().positive().parse(req.params.id);

// Eager loading por lote (sin N+1) de líneas de pedido usando ix_detalle_pedido_orden
async function ordersWithLines(rows) {
  if (rows.length === 0) return [];
  const placeholders = rows.map(() => '?').join(',');
  const [details] = await db.query(
    `SELECT id_detalle, id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, subtotal FROM detalle_pedido WHERE id_pedido IN (${placeholders}) ORDER BY id_detalle`,
    rows.map((r) => r.id_pedido)
  );
  const grouped = new Map(rows.map((r) => [r.id_pedido, []]));
  for (const d of details) {
    grouped.get(d.id_pedido)?.push({
      ...d,
      precio_unitario: Number(d.precio_unitario),
      subtotal: Number(d.subtotal),
    });
  }
  return rows.map((r) => ({
    ...r,
    total: Number(r.total),
    detalles: grouped.get(r.id_pedido) || [],
  }));
}

app.get(
  '/health',
  asyncRoute(async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ service: 'ms-pedidos', status: 'ok' });
  })
);

app.get('/metrics', (_req, res) => {
  res.json(getServiceMetrics('ms-pedidos'));
});

app.get(
  '/internal/pedidos/active-table-ids',
  internalOnly,
  asyncRoute(async (_req, res) => {
    const cached = cacheGet('orders:active_tables');
    if (cached) return res.json(cached);

    const [rows] = await db.query(
      "SELECT id_mesa FROM pedidos WHERE estado IN ('Pendiente','En preparación','Listo')"
    );
    const payload = { activeIds: rows.map((r) => r.id_mesa) };
    cacheSet('orders:active_tables', payload, 3000);
    res.json(payload);
  })
);

app.get(
  '/internal/pedidos/table/:id/has-history',
  internalOnly,
  asyncRoute(async (req, res) => {
    const [[r]] = await db.execute('SELECT 1 AS found FROM pedidos WHERE id_mesa=? LIMIT 1', [
      parseId(req),
    ]);
    res.json({ hasHistory: !!r });
  })
);

app.get(
  '/internal/pedidos/product/:id/has-history',
  internalOnly,
  asyncRoute(async (req, res) => {
    const [[r]] = await db.execute(
      'SELECT 1 AS found FROM detalle_pedido WHERE id_producto=? LIMIT 1',
      [parseId(req)]
    );
    res.json({ hasHistory: !!r });
  })
);

// Listado paginado con cursor o offset, pidiendo solo columnas necesarias
app.get(
  '/api/pedidos',
  requireRole('administrador', 'mesero', 'cocinero'),
  asyncRoute(async (req, res) => {
    const estado = req.query.estado ? z.enum(ALL_STATES).parse(req.query.estado) : null;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 250);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const cursor = req.query.cursor ? Number(req.query.cursor) : null;

    const cacheKey = `orders:list:${estado || 'all'}:${limit}:${offset}:${cursor || 0}`;
    const cached = cacheGet(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    const cols = 'id_pedido, id_mesa, id_usuario, fecha_pedido, estado, total';
    let rows;
    if (estado && cursor) {
      [rows] = await db.execute(
        `SELECT ${cols} FROM pedidos WHERE estado=? AND id_pedido < ? ORDER BY id_pedido DESC LIMIT ?`,
        [estado, cursor, limit]
      );
    } else if (estado) {
      [rows] = await db.execute(
        `SELECT ${cols} FROM pedidos WHERE estado=? ORDER BY id_pedido DESC LIMIT ? OFFSET ?`,
        [estado, limit, offset]
      );
    } else if (cursor) {
      [rows] = await db.execute(
        `SELECT ${cols} FROM pedidos WHERE id_pedido < ? ORDER BY id_pedido DESC LIMIT ?`,
        [cursor, limit]
      );
    } else {
      [rows] = await db.execute(
        `SELECT ${cols} FROM pedidos ORDER BY id_pedido DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );
    }

    const pedidos = await ordersWithLines(rows);
    const nextCursor = pedidos.length === limit ? pedidos[pedidos.length - 1].id_pedido : null;
    const payload = {
      pedidos,
      pagination: { limit, offset, nextCursor, hasMore: pedidos.length === limit },
    };
    cacheSet(cacheKey, payload, 2500);
    res.setHeader('X-Cache', 'MISS');
    res.json(payload);
  })
);

app.get(
  '/api/pedidos/:id',
  requireRole('administrador', 'mesero', 'cocinero'),
  asyncRoute(async (req, res) => {
    const [[row]] = await db.execute(
      'SELECT id_pedido, id_mesa, id_usuario, fecha_pedido, estado, total FROM pedidos WHERE id_pedido=?',
      [parseId(req)]
    );
    if (!row) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ pedido: (await ordersWithLines([row]))[0] });
  })
);

app.post(
  '/api/pedidos',
  requireRole('administrador', 'mesero'),
  asyncRoute(async (req, res) => {
    const input = createSchema.parse(req.body);
    const ids = input.items.map((i) => i.id_producto);
    if (new Set(ids).size !== ids.length) {
      return res
        .status(422)
        .json({ error: 'Cada producto debe aparecer una sola vez; sumar las cantidades' });
    }
    const conn = await db.getConnection();
    try {
      const keys = [`gb:table:${input.id_mesa}`, ...ids.map((i) => `gb:product:${i}`)];
      const result = await namedLocks(conn, keys, async () => {
        const snapshot = await internalFetch(`${catalogUrl()}/internal/catalog/snapshot`, {
          method: 'POST',
          body: { id_mesa: input.id_mesa, ids },
        });
        const products = new Map(snapshot.productos.map((p) => [p.id_producto, p]));
        const { lines, total } = calcLines(
          input.items.map((i) => ({ ...products.get(i.id_producto), cantidad: i.cantidad }))
        );
        if (Math.abs(input.total_confirmado - total) > 0.001) {
          throw Object.assign(
            new Error(`El total vigente es ${total}. Confirma nuevamente antes de guardar.`),
            { status: 409 }
          );
        }
        await conn.beginTransaction();
        try {
          const [r] = await conn.execute(
            "INSERT INTO pedidos(id_mesa, id_usuario, estado, total) VALUES(?,?,'Pendiente',?)",
            [input.id_mesa, req.actor.id_usuario, total]
          );

          // Corrección N+1: Inserción por lote (Batch INSERT) en una sola sentencia SQL
          const batchPlaceholders = lines.map(() => '(?,?,?,?,?,?)').join(',');
          const batchValues = [];
          for (const line of lines) {
            batchValues.push(
              r.insertId,
              line.id_producto,
              line.nombre_producto,
              line.cantidad,
              line.precio_unitario,
              line.subtotal
            );
          }
          await conn.query(
            `INSERT INTO detalle_pedido(id_pedido, id_producto, nombre_producto, cantidad, precio_unitario, subtotal) VALUES ${batchPlaceholders}`,
            batchValues
          );

          await conn.commit();
          return { id_pedido: r.insertId, id_mesa: input.id_mesa, estado: 'Pendiente', total };
        } catch (e) {
          await conn.rollback();
          throw e;
        }
      });

      cacheInvalidatePrefix('orders:');
      enqueueJob('notify_kds_new_order', result, async () => {});
      res.status(201).json({ pedido: result });
    } finally {
      conn.release();
    }
  })
);

app.patch(
  '/api/pedidos/:id/estado',
  requireRole('administrador', 'mesero', 'cocinero'),
  asyncRoute(async (req, res) => {
    const id = parseId(req);
    const { estado } = statusSchema.parse(req.body);
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [[record]] = await conn.execute('SELECT estado FROM pedidos WHERE id_pedido=? FOR UPDATE', [
        id,
      ]);
      if (!record) {
        await conn.rollback();
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }
      if (!transitionAllowed(record.estado, estado, req.actor.rol)) {
        await conn.rollback();
        return res.status(409).json({ error: 'Transición de estado o permiso no autorizado' });
      }
      await conn.execute('UPDATE pedidos SET estado=? WHERE id_pedido=?', [estado, id]);
      await conn.commit();
      cacheInvalidatePrefix('orders:');
      enqueueJob('audit_order_state_change', { id_pedido: id, from: record.estado, to: estado }, async () => {});
      res.json({ pedido: { id_pedido: id, estado } });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  })
);

app.use(apiError);
const PORT = Number(process.env.ORDERS_PORT) || 4003;
app.listen(PORT, process.env.HOST || '127.0.0.1', () => console.log(`ms-pedidos :${PORT}`));
