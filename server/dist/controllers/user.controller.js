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
exports.getHierarchyForUser = exports.getBalance = exports.getDownline = exports.createUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const parentId = req.user.id;
    try {
        const existingUser = yield User_1.default.findOne({ username });
        if (existingUser)
            return res.status(400).json({ message: 'Username already exists' });
        const newUser = new User_1.default({
            username,
            password,
            role: 'user',
            parentId,
            balance: 0
        });
        yield newUser.save();
        res.status(201).json({
            message: 'User created successfully',
            user: { id: newUser._id, username: newUser.username }
        });
    }
    catch (_a) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.createUser = createUser;
const getRecursiveDownline = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const children = yield User_1.default.find({ parentId: userId }, '-password');
    const result = [];
    for (const child of children) {
        const nested = yield getRecursiveDownline(child._id);
        result.push(Object.assign(Object.assign({}, child.toObject()), { children: nested }));
    }
    return result;
});
const getDownline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const downline = yield getRecursiveDownline(userId);
        res.json(downline);
    }
    catch (_a) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getDownline = getDownline;
const getBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const user = yield User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({ balance: user.balance });
    }
    catch (_a) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getBalance = getBalance;
const getHierarchyForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const requester = req.user;
    try {
        if (requester.role !== 'admin' && requester.id !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const users = yield User_1.default.find({ parentId: userId }, '-password');
        res.json(users);
    }
    catch (_a) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getHierarchyForUser = getHierarchyForUser;
