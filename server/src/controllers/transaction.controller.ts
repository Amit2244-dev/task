import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Transaction from '../models/Transaction';

export const transferBalance = async (req: Request, res: Response) => {
  const { toUserId, amount } = req.body;
  const fromUserId = (req as any).user.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const sender = await User.findOneAndUpdate(
      { _id: fromUserId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true }
    );

    if (!sender) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const recipient = await User.findOneAndUpdate(
      { _id: toUserId, parentId: fromUserId },
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!recipient) {
      // rollback manually
      await User.findByIdAndUpdate(fromUserId, { $inc: { balance: amount } });
      return res.status(400).json({ message: 'Invalid recipient' });
    }

    await Transaction.create({
      fromUserId,
      toUserId,
      amount,
      type: 'credit'
    });

    res.json({ message: 'Transfer successful', senderBalance: sender.balance });

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const transactions = await Transaction.find({
    $or: [{ fromUserId: userId }, { toUserId: userId }]
  })
    .populate('fromUserId', 'username')
    .populate('toUserId', 'username')
    .sort({ createdAt: -1 });

  // Add a relative type field for the frontend
  const mapped = transactions.map((tx: any) => {
    const txObj = tx.toObject();
    let relativeType = 'credit';

    if (txObj.type === 'self-recharge') {
      relativeType = 'credit';
    } else if (txObj.fromUserId?._id?.toString() === userId) {
      relativeType = 'debit';
    } else {
      relativeType = 'credit';
    }

    return {
      ...txObj,
      type: relativeType,
      fromUser: txObj.fromUserId,
      toUser: txObj.toUserId
    };
  });

  res.json(mapped);
};
