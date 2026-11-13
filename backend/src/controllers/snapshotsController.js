import pool from '../config/db.js';

export const getSnapshots = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, version_tag AS versionTag, branch, commit_hash AS commitHash, author, author_role AS authorRole, description, type, state_backup AS stateBackup, created_at AS timestamp FROM system_version_snapshots ORDER BY created_at DESC'
    );

    const snapshots = rows.map((s) => ({
      ...s,
      stateBackup: s.stateBackup ? JSON.parse(s.stateBackup) : undefined,
    }));

    res.json(snapshots);
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    res.status(500).json({ error: 'Error al consultar histórico de versiones' });
  }
};

export const createSnapshot = async (req, res) => {
  try {
    const { description, versionTag, author, authorRole } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'La descripción del snapshot es requerida' });
    }

    // Capturar estado actual completo de la base de datos
    const [users] = await pool.query('SELECT id, username, name, role, active, avatar FROM users');
    const [tables] = await pool.query('SELECT id, table_number AS tableNumber, capacity, area FROM restaurant_tables');
    const [products] = await pool.query('SELECT id, name, description, price, category, available, image, station FROM products');
    const [orders] = await pool.query('SELECT * FROM orders');
    const [orderItems] = await pool.query('SELECT * FROM order_items');

    const stateBackup = {
      users: users.map((u) => ({ ...u, active: Boolean(u.active) })),
      tables,
      products: products.map((p) => ({ ...p, price: Number(p.price), available: Boolean(p.available) })),
      orders,
      orderItems,
    };

    const snapshotId = `snap-${Date.now()}`;
    const nextTag = versionTag || `v1.${Date.now().toString().slice(-4)}-dev`;
    const commitHash = Math.random().toString(16).substring(2, 9);
    const authorName = author || 'Administrador';
    const resolvedRole = authorRole || 'administrador';

    await pool.query(
      'INSERT INTO system_version_snapshots (id, version_tag, branch, commit_hash, author, author_role, description, type, state_backup) VALUES (?, ?, "Dev", ?, ?, ?, ?, "recovery_point", ?)',
      [
        snapshotId,
        nextTag,
        commitHash,
        authorName,
        resolvedRole,
        description.trim(),
        JSON.stringify(stateBackup),
      ]
    );

    res.status(201).json({
      success: true,
      snapshot: {
        id: snapshotId,
        versionTag: nextTag,
        branch: 'Dev',
        commitHash,
        author: authorName,
        authorRole: resolvedRole,
        description: description.trim(),
        type: 'recovery_point',
        timestamp: new Date().toISOString(),
        stateBackup,
      },
    });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({ error: 'Error al generar punto de restauración' });
  }
};

export const rollbackSnapshot = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const [rows] = await connection.query(
      'SELECT id, version_tag, state_backup FROM system_version_snapshots WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Snapshot no encontrado' });
    }

    const snapshot = rows[0];
    if (!snapshot.state_backup) {
      return res.status(400).json({
        error: `El punto ${snapshot.version_tag} es una etiqueta de referencia histórica y no contiene un backup completo de datos.`,
      });
    }

    const backup = JSON.parse(snapshot.state_backup);

    await connection.beginTransaction();

    // Desactivar temporalmente checks de claves foráneas
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Limpiar tablas operativas
    await connection.query('TRUNCATE TABLE order_items');
    await connection.query('TRUNCATE TABLE orders');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE restaurant_tables');
    await connection.query('TRUNCATE TABLE users');

    // Restaurar Users
    if (backup.users && backup.users.length > 0) {
      for (const u of backup.users) {
        await connection.query(
          'INSERT INTO users (id, username, password_hash, name, role, active, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [u.id, u.username, u.password_hash || '', u.name, u.role, u.active ? 1 : 0, u.avatar || null]
        );
      }
    }

    // Restaurar Mesas
    if (backup.tables && backup.tables.length > 0) {
      for (const t of backup.tables) {
        await connection.query(
          'INSERT INTO restaurant_tables (id, table_number, capacity, area) VALUES (?, ?, ?, ?)',
          [t.id, t.tableNumber || t.table_number, t.capacity, t.area]
        );
      }
    }

    // Restaurar Productos
    if (backup.products && backup.products.length > 0) {
      for (const p of backup.products) {
        await connection.query(
          'INSERT INTO products (id, name, description, price, category, available, image, station) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [p.id, p.name, p.description, p.price, p.category, p.available ? 1 : 0, p.image, p.station]
        );
      }
    }

    // Restaurar Orders
    if (backup.orders && backup.orders.length > 0) {
      for (const o of backup.orders) {
        await connection.query(
          'INSERT INTO orders (id, table_id, user_id, status, total, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [o.id, o.table_id || o.tableId, o.user_id || o.userId, o.status, o.total, o.notes, o.created_at || o.createdAt, o.updated_at || o.updatedAt]
        );
      }
    }

    // Restaurar Order Items
    if (backup.orderItems && backup.orderItems.length > 0) {
      for (const oi of backup.orderItems) {
        await connection.query(
          'INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [oi.id, oi.order_id || oi.orderId, oi.product_id || oi.productId, oi.quantity, oi.unit_price || oi.unitPrice, oi.subtotal, oi.notes]
        );
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();

    res.json({
      success: true,
      message: `Sistema revertido exitosamente al estado del snapshot ${snapshot.version_tag}.`,
      versionTag: snapshot.version_tag,
    });
  } catch (error) {
    await connection.rollback();
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.error('Error during rollback:', error);
    res.status(500).json({ error: 'Error al ejecutar rollback del sistema' });
  } finally {
    connection.release();
  }
};

