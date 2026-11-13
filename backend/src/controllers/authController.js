import pool from '../config/db.js';

export const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, name, role, active, avatar FROM users ORDER BY id ASC'
    );
    const users = rows.map((u) => ({
      ...u,
      active: Boolean(u.active),
    }));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al consultar usuarios' });
  }
};

export const login = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Nombre de usuario requerido' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, name, role, active, avatar FROM users WHERE username = ?',
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = {
      ...rows[0],
      active: Boolean(rows[0].active),
    };

    if (!user.active) {
      return res.status(403).json({ error: 'Esta cuenta se encuentra inactiva. Contacte al Administrador.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, name, role, active = true, avatar } = req.body;
    if (!username || !name || !role) {
      return res.status(400).json({ error: 'username, name y role son obligatorios' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: `El nombre de usuario '${username}' ya está registrado` });
    }

    const defaultAvatar =
      avatar ||
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`;

    const [result] = await pool.query(
      'INSERT INTO users (username, name, role, active, avatar) VALUES (?, ?, ?, ?, ?)',
      [username.trim(), name.trim(), role, active ? 1 : 0, defaultAvatar]
    );

    res.status(201).json({
      id: result.insertId,
      username: username.trim(),
      name: name.trim(),
      role,
      active: Boolean(active),
      avatar: defaultAvatar,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, name, role, active, avatar } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const current = rows[0];
    const newUsername = username !== undefined ? username.trim() : current.username;
    const newName = name !== undefined ? name.trim() : current.name;
    const newRole = role !== undefined ? role : current.role;
    const newActive = active !== undefined ? (active ? 1 : 0) : current.active;
    const newAvatar = avatar !== undefined ? avatar : current.avatar;

    await pool.query(
      'UPDATE users SET username = ?, name = ?, role = ?, active = ?, avatar = ? WHERE id = ?',
      [newUsername, newName, newRole, newActive, newAvatar, id]
    );

    res.json({
      id: Number(id),
      username: newUsername,
      name: newName,
      role: newRole,
      active: Boolean(newActive),
      avatar: newAvatar,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT active FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const nextState = rows[0].active ? 0 : 1;
    await pool.query('UPDATE users SET active = ? WHERE id = ?', [nextState, id]);

    res.json({ id: Number(id), active: Boolean(nextState) });
  } catch (error) {
    console.error('Error toggling user active:', error);
    res.status(500).json({ error: 'Error al cambiar estado de usuario' });
  }
};

