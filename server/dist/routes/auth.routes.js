"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
router.post('/login', auth_controller_1.login);
router.post('/logout', auth_controller_1.logout);
router.get('/captcha', auth_controller_1.getCaptcha);
router.get('/check-auth', auth_controller_1.checkAuth);
exports.default = router;
