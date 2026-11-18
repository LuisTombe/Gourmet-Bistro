import pool from '../config/db.js';

export const getTables = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, table_number AS tableNumber, capacity, area FROM restaurant_tables ORDER BY table_number ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Error al consultar mesas' });
  }
};

export const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity, area } = req.body;
    if (!tableNumber || !capacity || !area) {
      return res.status(400).json({ error: 'Número de mesa, capacidad y área son obligatorios' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM restaurant_tables WHERE table_number = ?',
      [tableNumber]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: `La mesa #${tableNumber} ya existe en el sistema` });
    }

    const [result] = await pool.query(
      'INSERT INTO restaurant_tables (table_number, capacity, area) VALUES (?, ?, ?)',
      [tableNumber, capacity, area]
    );

    res.status(201).json({
      id: result.insertId,
      tableNumber: Number(tableNumber),
      capacity: Number(capacity),
      area,
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ error: 'Error al crear mesa' });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNumber, capacity, area } = req.body;

    const [rows] = await pool.query('SELECT * FROM restaurant_tables WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    const current = rows[0];
    const newNumber = tableNumber !== undefined ? Number(tableNumber) : current.table_number;
    const newCapacity = capacity !== undefined ? Number(capacity) : current.capacity;
    const newArea = area !== undefined ? area : current.area;

    // Si cambió el número, verificar unicidad
    if (newNumber !== current.table_number) {
      const [existing] = await pool.query(
        'SELECT id FROM restaurant_tables WHERE table_number = ? AND id != ?',
        [newNumber, id]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: `El número de mesa ${newNumber} ya está en uso` });
      }
    }

    await pool.query(
      'UPDATE restaurant_tables SET table_number = ?, capacity = ?, area = ? WHERE id = ?',
      [newNumber, newCapacity, newArea, id]
    );

    res.json({
      id: Number(id),
      tableNumber: newNumber,
      capacity: newCapacity,
      area: newArea,
    });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ error: 'Error al actualizar mesa' });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene pedidos activos (Pendiente, En preparación, Listo)
    const [activeOrders] = await pool.query(
      'SELECT id FROM orders WHERE table_id = ? AND status IN ("Pendiente", "En preparación", "Listo")',
      [id]
    );

    if (activeOrders.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la mesa porque tiene pedidos en curso en este momento.',
      });
    }

    // Si tiene pedidos históricos entregados, por integridad referencial se verifica
    const [allOrders] = await pool.query('SELECT id FROM orders WHERE table_id = ?', [id]);
    if (allOrders.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la mesa porque posee historial de comandas registradas.',
      });
    }

    await pool.query('DELETE FROM restaurant_tables WHERE id = ?', [id]);
    res.json({ success: true, message: 'Mesa eliminada con éxito' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ error: 'Error al eliminar mesa' });
  }
};

