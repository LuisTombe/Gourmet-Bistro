import pool from '../config/db.js';

export const getOrders = async (req, res) => {
  try {
    const [orderRows] = await pool.query(`
      SELECT 
        o.id,
        o.table_id AS tableId,
        t.table_number AS tableNumber,
        o.user_id AS userId,
        u.name AS waiterName,
        o.status,
        o.total,
        o.notes,
        o.created_at AS createdAt,
        o.updated_at AS updatedAt
      FROM orders o
      JOIN restaurant_tables t ON o.table_id = t.id
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
    `);

    if (orderRows.length === 0) {
      return res.json([]);
    }

    const orderIds = orderRows.map((o) => o.id);
    const [itemRows] = await pool.query(
      `
      SELECT 
        oi.id,
        oi.order_id AS orderId,
        oi.product_id AS productId,
        p.name AS productName,
        oi.quantity,
        oi.unit_price AS unitPrice,
        oi.subtotal,
        oi.notes
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (?)
      ORDER BY oi.id ASC
    `,
      [orderIds]
    );

    // Mapear items por orderId
    const itemsByOrder = {};
    itemRows.forEach((item) => {
      if (!itemsByOrder[item.orderId]) {
        itemsByOrder[item.orderId] = [];
      }
      itemsByOrder[item.orderId].push({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.subtotal),
        notes: item.notes || undefined,
      });
    });

    const orders = orderRows.map((o) => ({
      id: o.id,
      tableId: o.tableId,
      tableNumber: o.tableNumber,
      userId: o.userId,
      waiterName: o.waiterName,
      status: o.status,
      total: Number(o.total),
      notes: o.notes || undefined,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      items: itemsByOrder[o.id] || [],
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error al consultar comandas y pedidos' });
  }
};

export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { tableId, userId, items, notes } = req.body;

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'tableId y al menos un ítem son obligatorios' });
    }

    await connection.beginTransaction();

    // Validar que la mesa exista
    const [tables] = await connection.query('SELECT id, table_number FROM restaurant_tables WHERE id = ?', [tableId]);
    if (tables.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    const tableNumber = tables[0].table_number;

    // Verificar si la mesa ya tiene una comanda activa
    const [activeOrders] = await connection.query(
      'SELECT id FROM orders WHERE table_id = ? AND status IN ("Pendiente", "En preparación", "Listo")',
      [tableId]
    );
    if (activeOrders.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: `La mesa #${tableNumber} ya tiene un pedido activo en curso.` });
    }

    // Validar usuario / mesero
    const resolvedUserId = userId || 2; // fallback mesero default
    const [users] = await connection.query('SELECT id, name FROM users WHERE id = ?', [resolvedUserId]);
    const waiterName = users.length > 0 ? users[0].name : 'Mesero General';

    // Obtener productos para precios reales
    const productIds = items.map((i) => i.productId);
    const [products] = await connection.query('SELECT id, name, price, available FROM products WHERE id IN (?)', [
      productIds,
    ]);
    const productMap = new Map(products.map((p) => [p.id, p]));

    let calculatedTotal = 0;
    const itemsToInsert = [];

    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        await connection.rollback();
        return res.status(400).json({ error: `Producto ID ${item.productId} no encontrado.` });
      }
      if (!prod.available) {
        await connection.rollback();
        return res.status(400).json({ error: `El plato "${prod.name}" está marcado actualmente como agotado.` });
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitPrice = Number(prod.price);
      const subtotal = qty * unitPrice;
      calculatedTotal += subtotal;

      itemsToInsert.push({
        productId: prod.id,
        productName: prod.name,
        quantity: qty,
        unitPrice,
        subtotal,
        notes: item.notes || null,
      });
    }

    // Insertar Order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (table_id, user_id, status, total, notes) VALUES (?, ?, "Pendiente", ?, ?)',
      [tableId, resolvedUserId, calculatedTotal, notes || null]
    );
    const orderId = orderResult.insertId;

    // Insertar Items
    const insertedItems = [];
    for (const item of itemsToInsert) {
      const [itemResult] = await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.unitPrice, item.subtotal, item.notes]
      );
      insertedItems.push({
        id: itemResult.insertId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        notes: item.notes || undefined,
      });
    }

    await connection.commit();

    const createdOrder = {
      id: orderId,
      tableId: Number(tableId),
      tableNumber,
      userId: resolvedUserId,
      waiterName,
      status: 'Pendiente',
      total: calculatedTotal,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: insertedItems,
    };

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error al registrar el pedido' });
  } finally {
    connection.release();
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pendiente', 'En preparación', 'Listo', 'Entregado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado de pedido no válido' });
    }

    const [rows] = await pool.query('SELECT status FROM orders WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const currentStatus = rows[0].status;

    // Validar transición de estados
    const validTransitions = {
      'Pendiente': ['En preparación'],
      'En preparación': ['Listo'],
      'Listo': ['Entregado'],
      'Entregado': [],
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        error: `Transición no permitida de '${currentStatus}' a '${status}'`,
      });
    }

    await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

    res.json({
      success: true,
      orderId: Number(id),
      previousStatus: currentStatus,
      status,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error al cambiar estado del pedido' });
  }
};

