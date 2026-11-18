import 'dotenv/config';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import {
  poolFor,
  hashToken,
  issueToken,
  cookieValue,
  sessionCookie,
  clearSessionCookie,
  asyncRoute,
  apiError,
  internalOnly,
  internalFetch,
  baseUrl,
  otelTraceMiddleware,
  compressionAndCacheMiddleware,
  getServiceMetrics,
  cacheGet,
  cacheSet,
  cacheInvalidatePrefix,
  enqueueJob,
} from '../shared/infra.mjs';

const execFileAsync = promisify(execFile);
const catalogUrl = () => baseUrl('CATALOG_URL', 'http://127.0.0.1:4002');
const ordersUrl = () => baseUrl('ORDERS_URL', 'http://127.0.0.1:4003');

const db = poolFor('usuarios');
const app = express();
app.disable('x-powered-by');
app.use(otelTraceMiddleware('ms-usuarios'));
app.use(compressionAndCacheMiddleware);
app.use(express.json({ limit: '16kb' }));

const loginSchema = z.object({
  nombre_usuario: z.string().trim().min(1).max(50),
  contrasena: z.string().min(1),
});
const userSchema = z
  .object({
    nombre_usuario: z.string().trim().min(1).max(50),
    contrasena: z.string().min(8).max(128),
    rol: z.enum(['administrador', 'mesero', 'cocinero']),
  })
  .strict();
const patchSchema = z
  .object({
    nombre_usuario: z.string().trim().min(1).max(50).optional(),
    rol: z.enum(['administrador', 'mesero', 'cocinero']).optional(),
  })
  .strict()
  .refine((x) => Object.keys(x).length > 0);

const publicUser = (r) => ({
  id_usuario: r.id_usuario,
  nombre_usuario: r.nombre_usuario,
  rol: r.rol,
  activo: !!r.activo,
});

async function findSession(token) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const cacheKey = `auth_user:${tokenHash}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const [rows] = await db.execute(
    'SELECT id_usuario, nombre_usuario, rol, activo FROM usuarios WHERE sesion_token_hash=? AND sesion_expira_en>NOW() AND activo=1 LIMIT 1',
    [tokenHash]
  );
  const user = rows[0] ? publicUser(rows[0]) : null;
  if (user) cacheSet(cacheKey, user, 10000);
  return user;
}

const guard = (...roles) =>
  asyncRoute(async (req, res, next) => {
    const actor = await findSession(cookieValue(req));
    if (!actor) return res.status(401).json({ error: 'Sesión no válida' });
    if (!roles.includes(actor.rol)) return res.status(403).json({ error: 'Permiso denegado' });
    req.actor = actor;
    next();
  });

app.get(
  '/health',
  asyncRoute(async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ service: 'ms-usuarios', status: 'ok' });
  })
);

app.get('/metrics', (_req, res) => {
  res.json(getServiceMetrics('ms-usuarios'));
});

app.post(
  '/internal/auth/verify',
  internalOnly,
  asyncRoute(async (req, res) => {
    const actor = await findSession(z.object({ token: z.string().min(1) }).parse(req.body).token);
    if (!actor) return res.status(401).json({ error: 'Sesión inválida' });
    res.json({ user: actor });
  })
);

app.post(
  '/api/auth/login',
  asyncRoute(async (req, res) => {
    const { nombre_usuario, contrasena } = loginSchema.parse(req.body);
    // Selección explícita únicamente de las columnas requeridas (nunca SELECT *)
    const [rows] = await db.execute(
      'SELECT id_usuario, nombre_usuario, contrasena_hash, rol, activo FROM usuarios WHERE nombre_usuario=? LIMIT 1',
      [nombre_usuario]
    );
    const record = rows[0];
    const verified = record && record.activo && (await bcrypt.compare(contrasena, record.contrasena_hash));
    if (!verified) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const hours = Number(process.env.SESSION_HOURS) || 8;
    const token = issueToken();
    const tokenHash = hashToken(token);
    await db.execute(
      'UPDATE usuarios SET sesion_token_hash=?, sesion_expira_en=DATE_ADD(NOW(),INTERVAL ? SECOND) WHERE id_usuario=?',
      [tokenHash, Math.floor(hours * 3600), record.id_usuario]
    );
    const userPayload = publicUser(record);
    cacheSet(`auth_user:${tokenHash}`, userPayload, 10000);
    res.setHeader('Set-Cookie', sessionCookie(token, hours));

    enqueueJob('audit_login', { id_usuario: record.id_usuario, rol: record.rol }, async () => {});
    res.json({ usuario: userPayload });
  })
);

app.get(
  '/api/auth/me',
  asyncRoute(async (req, res) => {
    const actor = await findSession(cookieValue(req));
    if (!actor) return res.status(401).json({ error: 'Sesión no válida' });
    res.json({ usuario: actor });
  })
);

app.post(
  '/api/auth/logout',
  asyncRoute(async (req, res) => {
    const token = cookieValue(req);
    if (token) {
      const tokenHash = hashToken(token);
      cacheInvalidatePrefix(`auth_user:${tokenHash}`);
      cacheInvalidatePrefix(`session:${tokenHash}`);
      await db.execute(
        'UPDATE usuarios SET sesion_token_hash=NULL, sesion_expira_en=NULL WHERE sesion_token_hash=?',
        [tokenHash]
      );
    }
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.json({ ok: true });
  })
);

app.get(
  '/api/usuarios',
  guard('administrador'),
  asyncRoute(async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const cursor = req.query.cursor ? Number(req.query.cursor) : null;

    const cacheKey = `users:list:${limit}:${offset}:${cursor || 0}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const [rows] = cursor
      ? await db.execute(
          'SELECT id_usuario, nombre_usuario, rol, activo FROM usuarios WHERE id_usuario > ? ORDER BY id_usuario ASC LIMIT ?',
          [cursor, limit]
        )
      : await db.execute(
          'SELECT id_usuario, nombre_usuario, rol, activo FROM usuarios ORDER BY id_usuario ASC LIMIT ? OFFSET ?',
          [limit, offset]
        );

    const usuarios = rows.map(publicUser);
    const nextCursor = usuarios.length === limit ? usuarios[usuarios.length - 1].id_usuario : null;
    const payload = {
      usuarios,
      pagination: { limit, offset, nextCursor, hasMore: usuarios.length === limit },
    };
    cacheSet(cacheKey, payload, 10000);
    res.json(payload);
  })
);

app.post(
  '/api/usuarios',
  guard('administrador'),
  asyncRoute(async (req, res) => {
    const input = userSchema.parse(req.body);
    const hash = await bcrypt.hash(input.contrasena, 12);
    const [r] = await db.execute(
      'INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol, activo) VALUES(?,?,?,1)',
      [input.nombre_usuario, hash, input.rol]
    );
    cacheInvalidatePrefix('users:');
    res.status(201).json({
      usuario: {
        id_usuario: r.insertId,
        nombre_usuario: input.nombre_usuario,
        rol: input.rol,
        activo: true,
      },
    });
  })
);

app.patch(
  '/api/usuarios/:id',
  guard('administrador'),
  asyncRoute(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const input = patchSchema.parse(req.body);
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [[target]] = await conn.execute(
        'SELECT id_usuario, rol FROM usuarios WHERE id_usuario=? FOR UPDATE',
        [id]
      );
      if (!target) {
        await conn.rollback();
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      if (target.rol === 'administrador' && input.rol && input.rol !== 'administrador') {
        const [[count]] = await conn.query(
          'SELECT COUNT(*) AS n FROM usuarios WHERE rol="administrador" AND activo=1'
        );
        if (count.n <= 1) {
          await conn.rollback();
          return res.status(409).json({ error: 'Debe permanecer un administrador activo' });
        }
      }
      const cols = [];
      const params = [];
      if (input.nombre_usuario !== undefined) {
        cols.push('nombre_usuario=?');
        params.push(input.nombre_usuario);
      }
      if (input.rol !== undefined) {
        cols.push('rol=?');
        params.push(input.rol);
        cols.push('sesion_token_hash=NULL', 'sesion_expira_en=NULL');
      }
      params.push(id);
      await conn.execute(`UPDATE usuarios SET ${cols.join(',')} WHERE id_usuario=?`, params);
      await conn.commit();
      cacheInvalidatePrefix('users:');
      cacheInvalidatePrefix('auth_user:');
      cacheInvalidatePrefix('session:');
      res.json({ ok: true });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  })
);

app.patch(
  '/api/usuarios/:id/desactivar',
  guard('administrador'),
  asyncRoute(async (req, res) => {
    const id = z.coerce.number().int().positive().parse(req.params.id);
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [[target]] = await conn.execute(
        'SELECT id_usuario, rol, activo FROM usuarios WHERE id_usuario=? FOR UPDATE',
        [id]
      );
      if (!target) {
        await conn.rollback();
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      if (target.rol === 'administrador' && target.activo) {
        const [[count]] = await conn.query(
          'SELECT COUNT(*) AS n FROM usuarios WHERE rol="administrador" AND activo=1'
        );
        if (count.n <= 1) {
          await conn.rollback();
          return res.status(409).json({ error: 'Debe permanecer un administrador activo' });
        }
      }
      await conn.execute(
        'UPDATE usuarios SET activo=0, sesion_token_hash=NULL, sesion_expira_en=NULL WHERE id_usuario=?',
        [id]
      );
      await conn.commit();
      cacheInvalidatePrefix('users:');
      cacheInvalidatePrefix('auth_user:');
      cacheInvalidatePrefix('session:');
      res.json({ ok: true });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  })
);

let snapshotsTableReady = false;
async function ensureSnapshotsTable() {
  if (snapshotsTableReady) return;
  await db.query(`
    CREATE TABLE IF NOT EXISTS system_snapshots (
      id_snapshot VARCHAR(64) PRIMARY KEY,
      version_tag VARCHAR(64) NOT NULL,
      branch VARCHAR(64) NOT NULL,
      commit_hash VARCHAR(64) NOT NULL,
      autor_id INT NOT NULL,
      autor_nombre VARCHAR(50) NOT NULL,
      autor_rol VARCHAR(30) NOT NULL,
      descripcion VARCHAR(255) NOT NULL,
      tipo ENUM('git_release','audit_snapshot','recovery_point') NOT NULL DEFAULT 'recovery_point',
      estado_json LONGTEXT NOT NULL,
      creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX ix_snapshots_creado (creado_en DESC)
    ) ENGINE=InnoDB
  `);
  snapshotsTableReady = true;
}

async function readGitInfo() {
  try {
    const [{ stdout: branchOut }, { stdout: hashOut }, { stdout: logOut }] = await Promise.all([
      execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD']),
      execFileAsync('git', ['rev-parse', '--short', 'HEAD']),
      execFileAsync('git', ['log', '-n', '10', '--pretty=format:%h|%an|%aI|%s']),
    ]);
    const commits = logOut
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [hash, author, date, ...msg] = line.split('|');
        return { hash, author, date, message: msg.join('|') };
      });
    return {
      branch: branchOut.trim() || 'local',
      headHash: hashOut.trim() || 'local',
      commits,
    };
  } catch {
    return { branch: 'local', headHash: 'local', commits: [] };
  }
}

const snapshotCreateSchema = z
  .object({
    descripcion: z.string().trim().min(1).max(255),
    version_tag: z.string().trim().min(1).max(64).optional(),
    tipo: z.enum(['git_release', 'audit_snapshot', 'recovery_point']).optional(),
  })
  .strict();

app.get(
  '/api/versionamiento/git',
  guard('administrador'),
  asyncRoute(async (_req, res) => {
    const info = await readGitInfo();
    res.json(info);
  })
);

app.get(
  '/api/snapshots',
  guard('administrador'),
  asyncRoute(async (_req, res) => {
    await ensureSnapshotsTable();
    const [rows] = await db.query(
      'SELECT id_snapshot, version_tag, branch, commit_hash, autor_id, autor_nombre, autor_rol, descripcion, tipo, creado_en FROM system_snapshots ORDER BY creado_en DESC LIMIT 50'
    );
    res.json({
      snapshots: rows.map((r) => ({
        id: r.id_snapshot,
        versionTag: r.version_tag,
        branch: r.branch,
        commitHash: r.commit_hash,
        author: r.autor_nombre,
        authorRole: r.autor_rol,
        timestamp: r.creado_en instanceof Date ? r.creado_en.toISOString() : String(r.creado_en),
        description: r.descripcion,
        type: r.tipo,
      })),
    });
  })
);

app.post(
  '/api/snapshots',
  guard('administrador'),
  asyncRoute(async (req, res) => {
    await ensureSnapshotsTable();
    const input = snapshotCreateSchema.parse(req.body);
    const [gitInfo, [usuarios], catalogData, ordersData] = await Promise.all([
      readGitInfo(),
      db.query('SELECT id_usuario, nombre_usuario, rol, activo FROM usuarios ORDER BY id_usuario ASC'),
      internalFetch(`${catalogUrl()}/internal/catalog/export`),
      internalFetch(`${ordersUrl()}/internal/pedidos/export`),
    ]);

    const [[countRow]] = await db.query('SELECT COUNT(*) AS n FROM system_snapshots');
    const idSnapshot = `snap-${Date.now()}`;
    const versionTag = input.version_tag || `v1.${Number(countRow.n) + 1}.0-${gitInfo.branch}`;
    const tipo = input.tipo || 'recovery_point';

    const stateBackup = {
      usuarios: usuarios.map(publicUser),
      productos: catalogData.productos,
      mesas: catalogData.mesas,
      pedidos: ordersData.pedidos,
      detalle_pedido: ordersData.detalle_pedido,
    };

    await db.execute(
      'INSERT INTO system_snapshots(id_snapshot, version_tag, branch, commit_hash, autor_id, autor_nombre, autor_rol, descripcion, tipo, estado_json) VALUES(?,?,?,?,?,?,?,?,?,?)',
      [
        idSnapshot,
        versionTag,
        gitInfo.branch,
        gitInfo.headHash,
        req.actor.id_usuario,
        req.actor.nombre_usuario,
        req.actor.rol,
        input.descripcion,
        tipo,
        JSON.stringify(stateBackup),
      ]
    );

    res.status(201).json({
      snapshot: {
        id: idSnapshot,
        versionTag,
        branch: gitInfo.branch,
        commitHash: gitInfo.headHash,
        author: req.actor.nombre_usuario,
        authorRole: req.actor.rol,
        timestamp: new Date().toISOString(),
        description: input.descripcion,
        type: tipo,
      },
    });
  })
);

app.post(
  '/api/snapshots/:id/rollback',
  guard('administrador'),
  asyncRoute(async (req, res) => {
    await ensureSnapshotsTable();
    const snapId = z.string().trim().min(1).max(64).parse(req.params.id);
    const [[row]] = await db.execute(
      'SELECT id_snapshot, version_tag, estado_json FROM system_snapshots WHERE id_snapshot=? LIMIT 1',
      [snapId]
    );
    if (!row) return res.status(404).json({ error: 'Punto de restauración no encontrado' });

    const state = JSON.parse(row.estado_json);

    // Restaurar catálogo y pedidos en sus respectivos microservicios (orden FK respetado internamente)
    await Promise.all([
      internalFetch(`${catalogUrl()}/internal/catalog/restore`, {
        method: 'POST',
        body: { productos: state.productos || [], mesas: state.mesas || [] },
      }),
      internalFetch(`${ordersUrl()}/internal/pedidos/restore`, {
        method: 'POST',
        body: { pedidos: state.pedidos || [], detalle_pedido: state.detalle_pedido || [] },
      }),
    ]);

    // Restaurar roles/estado de usuarios existentes preservando contraseñas y la sesión actual del admin
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const u of state.usuarios || []) {
        const activo = u.id_usuario === req.actor.id_usuario ? 1 : u.activo ? 1 : 0;
        const rol = u.id_usuario === req.actor.id_usuario ? req.actor.rol : u.rol;
        await conn.execute('UPDATE usuarios SET nombre_usuario=?, rol=?, activo=? WHERE id_usuario=?', [
          u.nombre_usuario,
          rol,
          activo,
          u.id_usuario,
        ]);
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    cacheInvalidatePrefix('users:');
    res.json({ ok: true, versionTag: row.version_tag, id: row.id_snapshot });
  })
);

app.use(apiError);
const PORT = Number(process.env.USERS_PORT) || 4001;
app.listen(PORT, process.env.HOST || '127.0.0.1', () => console.log(`ms-usuarios :${PORT}`));
