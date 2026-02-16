"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.transferBalance = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const transferBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { toUserId, amount } = req.body;
    const fromUserId = req.user.id;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    const session = yield mongoose_1.default.startSession();
    try {
        yield session.withTransaction(() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const sender = yield User_1.default.findById(fromUserId).session(session);
            const recipient = yield User_1.default.findById(toUserId).session(session);
            if (!sender || !recipient)
                throw new Error('User not found');
            if (((_a = recipient.parentId) === null || _a === void 0 ? void 0 : _a.toString()) !== sender._id.toString()) {
                throw new Error('Can only transfer to direct next-level users');
            }
            if (sender.balance < amount) {
                throw new Error('Insufficient balance');
            }
            sender.balance -= amount;
            recipient.balance += amount;
            yield sender.save({ session });
            yield recipient.save({ session });
            yield Transaction_1.default.create([{
                    fromUserId: sender._id,
                    toUserId: recipient._id,
                    amount,
                    type: 'DEBIT'
                }], { session });
            yield Transaction_1.default.create([{
                    fromUserId: sender._id,
                    toUserId: recipient._id,
                    amount,
                    type: 'CREDIT'
                }], { session });
        }));
        res.json({ message: 'Transfer successful' });
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Transfer failed' });
    }
    finally {
        session.endSession();
    }
});
exports.transferBalance = transferBalance;
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const transactions = yield Transaction_1.default.find({
            $or: [{ fromUserId: userId }, { toUserId: userId }]
        })
            .populate('fromUserId', 'username')
            .populate('toUserId', 'username')
            .sort({ timestamp: -1 });
        res.json(transactions);
    }
    catch (_a) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getHistory = getHistory;
