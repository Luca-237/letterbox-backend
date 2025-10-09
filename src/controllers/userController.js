import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// Registro de un nuevo usuario
export const registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await pool.query('CALL sp_registrar_usuario(?, ?)', [username, passwordHash]);
    res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el usuario.', error: error.message });
  }
};

// Aquí iría la función para el login (sp_verificar_login)
// export const loginUser = async (req, res) => { ... }