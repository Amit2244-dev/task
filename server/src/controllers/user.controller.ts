import { Request, Response } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';

const getRecursiveDownline = async (userId: mongoose.Types.ObjectId): Promise<any> => {
  const children = await User.find({ parentId: userId }, '-password');
  const result = [];

  for (const child of children) {
    const nested = await getRecursiveDownline(child._id as mongoose.Types.ObjectId);
    result.push({ ...child.toObject(), children: nested });
  }

  return result;
};

export const createUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const parentId = (req as any).user.id;

  try {
    const parent = await User.findById(parentId);
    if (!parent) return res.status(404).json({ message: 'Parent user not found' });

    const newUser = new User({
      username,
      password,
      parentId,
      level: parent.level + 1,
      role: 'user'
    });
    await newUser.save();

    res.json({ message: 'User created', user: { _id: newUser._id, username: newUser.username, level: newUser.level } });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

export const getDownline = async (req: Request, res: Response) => {
  const downline = await getRecursiveDownline(
    new mongoose.Types.ObjectId((req as any).user.id)
  );
  res.json(downline);
};

export const getChildren = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const children = await User.find({ parentId: userId }, '-password');
  res.json(children);
};

export const getBalance = async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id);
  res.json({ balance: user?.balance ?? 0 });
};

export const changeChildPassword = async (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;
  const requesterId = (req as any).user.id;

  const child = await User.findById(userId);
  if (!child || child.parentId?.toString() !== requesterId)
    return res.status(403).json({ message: 'Not allowed. You can only change passwords of your direct children.' });

  child.password = newPassword;
  await child.save();

  res.json({ message: 'Password changed' });
};

export const selfRecharge = async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id);
  if (!user || user.role !== 'admin')
    return res.status(403).json({ message: 'Only admin/owner can self-recharge' });

  const amount = Number(req.body.amount);
  if (!amount || amount <= 0)
    return res.status(400).json({ message: 'Invalid amount' });

  user.balance += amount;
  await user.save();

  // Record the self-recharge transaction
  const Transaction = (await import('../models/Transaction')).default;
  await Transaction.create({
    fromUserId: user._id,
    toUserId: user._id,
    amount,
    type: 'self-recharge'
  });

  res.json({ balance: user.balance });
};

export const getBalanceSummary = async (req: Request, res: Response) => {
  const requesterId = (req as any).user.id;

  // Get all users in the requester's downline recursively
  const allUsers = await getRecursiveDownlineFlat(new mongoose.Types.ObjectId(requesterId));

  // Include the requester themselves
  const requester = await User.findById(requesterId, '-password');
  if (requester) {
    allUsers.unshift({
      _id: requester._id,
      username: requester.username,
      role: requester.role,
      level: requester.level,
      balance: requester.balance
    });
  }

  const totalBalance = allUsers.reduce((sum: number, u: any) => sum + (u.balance || 0), 0);

  res.json({ users: allUsers, totalBalance });
};

const getRecursiveDownlineFlat = async (userId: mongoose.Types.ObjectId): Promise<any[]> => {
  const children = await User.find({ parentId: userId }, '-password');
  let result: any[] = [];

  for (const child of children) {
    result.push({
      _id: child._id,
      username: child.username,
      role: child.role,
      level: child.level,
      balance: child.balance,
      parentId: child.parentId
    });
    const nested = await getRecursiveDownlineFlat(child._id as mongoose.Types.ObjectId);
    result = result.concat(nested);
  }

  return result;
};
