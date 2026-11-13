import pool from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, description, price, category, available, image, station FROM products ORDER BY id ASC'
    );
    const products = rows.map((p) => ({
      ...p,
      price: Number(p.price),
      available: Boolean(p.available),
    }));
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error al consultar catálogo de productos' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, available = true, image, station } = req.body;
    if (!name || price === undefined || !category || !station) {
      return res.status(400).json({ error: 'Nombre, precio, categoría y estación son requeridos' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }

    const defaultImg =
      image ||
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';

    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, category, available, image, station) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), description || '', numPrice, category, available ? 1 : 0, defaultImg, station]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      description: description || '',
      price: numPrice,
      category,
      available: Boolean(available),
      image: defaultImg,
      station,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error al registrar plato en el menú' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, available, image, station } = req.body;

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const current = rows[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newDescription = description !== undefined ? description : current.description;
    const newPrice = price !== undefined ? Number(price) : Number(current.price);
    const newCategory = category !== undefined ? category : current.category;
    const newAvailable = available !== undefined ? (available ? 1 : 0) : current.available;
    const newImage = image !== undefined ? image : current.image;
    const newStation = station !== undefined ? station : current.station;

    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, available = ?, image = ?, station = ? WHERE id = ?',
      [newName, newDescription, newPrice, newCategory, newAvailable, newImage, newStation, id]
    );

    res.json({
      id: Number(id),
      name: newName,
      description: newDescription,
      price: newPrice,
      category: newCategory,
      available: Boolean(newAvailable),
      image: newImage,
      station: newStation,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

export const toggleProductAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT available FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const nextState = rows[0].available ? 0 : 1;
    await pool.query('UPDATE products SET available = ? WHERE id = ?', [nextState, id]);

    res.json({ id: Number(id), available: Boolean(nextState) });
  } catch (error) {
    console.error('Error toggling product availability:', error);
    res.status(500).json({ error: 'Error al cambiar disponibilidad del producto' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si está en pedidos activos
    const [activeItems] = await pool.query(
      `SELECT oi.id 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.product_id = ? AND o.status IN ('Pendiente', 'En preparación', 'Listo')`,
      [id]
    );

    if (activeItems.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el producto porque está presente en comandas activas de cocina.',
      });
    }

    // Verificar si tiene historial
    const [allItems] = await pool.query('SELECT id FROM order_items WHERE product_id = ?', [id]);
    if (allItems.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el producto porque tiene pedidos históricos asociados. Sugerencia: márquelo como no disponible.',
      });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Producto eliminado del catálogo' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

