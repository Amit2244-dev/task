import { Router } from 'express';
import { login, logout, getCaptcha, checkAuth } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/captcha', getCaptcha);
router.post('/login', login);
router.post('/logout', logout);
router.get('/check-auth', checkAuth);

export default router;
