import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

/**
 * Registra un nuevo usuario
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validaciones
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

    console.log(`👤 Registrando usuario: ${username}`);
    
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    
    await pool.query('CALL sp_registrar_usuario(?, ?)', [username.trim(), passwordHash]);
    
    console.log(`✅ Usuario ${username} registrado exitosamente`);
    
    // Generar token JWT
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
    console.error('❌ Error al registrar usuario:', error);
    
    // Manejo de errores específicos de MySQL
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

/**
 * Autentica un usuario
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        message: 'Usuario y contraseña son requeridos.',
        code: 'MISSING_FIELDS'
      });
    }

    console.log(`🔐 Intentando login para: ${username}`);
    
    const [results] = await pool.query('CALL sp_verificar_login(?)', [username.trim()]);
    
    if (!results[0] || results[0].length === 0) {
      return res.status(401).json({
        message: 'Credenciales inválidas.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const user = results[0][0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Credenciales inválidas.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    console.log(`✅ Login exitoso para: ${username}`);
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login exitoso.',
      data: {
        id: user.id,
        username: user.username,
        createdAt: user.created_at,
        token
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      message: 'Error interno del servidor.',
      code: 'LOGIN_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};