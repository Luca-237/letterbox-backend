import { getDatabase } from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Usuario y contraseña son requeridos.',
        code: 'MISSING_FIELDS'
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({
        message: 'El nombre de usuario debe tener entre 3 y 20 caracteres.',
        code: 'INVALID_USERNAME_LENGTH'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'La contraseña debe tener al menos 6 caracteres.',
        code: 'INVALID_PASSWORD_LENGTH'
      });
    }

    console.log(`Registrando usuario: ${username}`);
    
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const db = getDatabase();
    const result = await db.run(
      'INSERT INTO usuarios (nombre, password_hash) VALUES (?, ?)',
      [username.trim(), passwordHash]
    );
    
    console.log(`Usuario ${username} registrado exitosamente con ID: ${result.insertId}`);
    
    const token = jwt.sign(
      { userId: result.insertId, username: username.trim() },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      success: true,
      message: 'Usuario registrado con éxito.',
      data: { 
        username: username.trim(),
        token,
        userId: result.insertId
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'El nombre de usuario ya existe.',
        code: 'USERNAME_EXISTS'
      });
    }
    
    res.status(500).json({ 
      message: 'Error al registrar el usuario.',
      code: 'REGISTRATION_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        message: 'Usuario y contraseña son requeridos.',
        code: 'MISSING_FIELDS'
      });
    }

    console.log(`Intentando login para: ${username}`);
    
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, nombre, password_hash, created_at FROM usuarios WHERE nombre = ?',
      [username.trim()]
    );
    
    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas.',
        code: 'INVALID_CREDENTIALS'
      });
    } 
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Credenciales inválidas.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log(`Login exitoso para: ${user.nombre}`);
    
     const token = jwt.sign(

      { userId: user.id, username: user.nombre },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login exitoso.',
      data: {
        id: user.id,

        username: user.nombre, 
        createdAt: user.created_at,
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      message: 'Error interno del servidor.',
      code: 'LOGIN_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
