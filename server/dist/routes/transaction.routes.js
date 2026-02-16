"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/transfer', auth_middleware_1.verifyToken, transaction_controller_1.transferBalance);
router.get('/history', auth_middleware_1.verifyToken, transaction_controller_1.getHistory);
exports.default = router;
