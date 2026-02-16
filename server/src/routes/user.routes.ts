import { Router } from 'express';
import {
  createUser,
  getDownline,
  getChildren,
  getBalance,
  changeChildPassword,
  selfRecharge,
  getBalanceSummary
} from '../controllers/user.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/create', verifyToken, createUser);
router.get('/downline', verifyToken, getDownline);
router.get('/children', verifyToken, getChildren);
router.get('/balance', verifyToken, getBalance);
router.get('/balance-summary', verifyToken, getBalanceSummary);
router.post('/change-password', verifyToken, changeChildPassword);
router.post('/self-recharge', verifyToken, selfRecharge);

export default router;
