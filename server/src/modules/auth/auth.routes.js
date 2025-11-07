// server/src/modules/auth/auth.routes.js
import express from 'express';
import { register, login, logout, me } from './auth.controller.js';
// import authMiddleware from '../../middleware/auth.middleware.js';
import authMiddleware from '../../middleware/auth.middleware.js'


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// protected route to get current user
router.get('/me', authMiddleware, me);

export default router;
