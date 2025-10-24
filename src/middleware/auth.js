import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/db.js';

/**
 * Middleware para verificar el token JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        message: 'Token de acceso requerido.',
        code: 'MISSING_TOKEN'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const db = getDatabase();
    const user = await db.get('SELECT id, nombre FROM usuarios WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({
        message: 'Usuario no encontrado.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: decoded.userId,
      username: user.nombre
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Token inválido.',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expirado.',
        code: 'TOKEN_EXPIRED'
      });
    }

    res.status(500).json({
      message: 'Error en la autenticación.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware opcional - no requiere autenticación pero la usa si está disponible
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      const db = getDatabase();
      const user = await db.get('SELECT id, nombre FROM usuarios WHERE id = ?', [decoded.userId]);
      
      if (user) {
        req.user = {
          id: decoded.userId,
          username: user.nombre
        };
      }
    }

    next();
  } catch (error) {
    // Si hay error, continuamos sin autenticación
    next();
  }
};