import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const router = Router();

// Rutas de autenticación
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;