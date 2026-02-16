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
exports.checkAuth = exports.logout = exports.getCaptcha = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const svg_captcha_1 = __importDefault(require("svg-captcha"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(501).json({ message: 'Use /api/users/create to register new users' });
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, password, captcha } = req.body;
    if (!req.session || ((_a = req.session.captcha) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== (captcha === null || captcha === void 0 ? void 0 : captcha.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid CAPTCHA' });
    }
    try {
        const user = yield User_1.default.findOne({ username });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });
        const isMatch = yield user.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        req.session.captcha = null;
        res.json({
            message: 'Logged in successfully',
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                balance: user.balance
            }
        });
    }
    catch (_b) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.login = login;
const getCaptcha = (req, res) => {
    const captcha = svg_captcha_1.default.create();
    if (req.session)
        req.session.captcha = captcha.text;
    res.type('svg');
    res.status(200).send(captcha.data);
};
exports.getCaptcha = getCaptcha;
const logout = (req, res) => {
    var _a;
    res.clearCookie('token');
    (_a = req.session) === null || _a === void 0 ? void 0 : _a.destroy(() => { });
    res.json({ message: 'Logged out' });
};
exports.logout = logout;
const checkAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ isAuthenticated: false });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = yield User_1.default.findById(decoded.id).select('-password');
        if (!user)
            return res.status(401).json({ isAuthenticated: false });
        res.json({ isAuthenticated: true, user });
    }
    catch (_a) {
        res.status(401).json({ isAuthenticated: false });
    }
});
exports.checkAuth = checkAuth;
