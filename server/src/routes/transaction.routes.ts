import { Router } from 'express';
import { transferBalance, getHistory } from '../controllers/transaction.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/transfer', verifyToken, transferBalance);
router.get('/history', verifyToken, getHistory);

export default router;
