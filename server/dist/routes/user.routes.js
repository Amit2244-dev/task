"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/create', auth_middleware_1.verifyToken, user_controller_1.createUser);
router.get('/downline', auth_middleware_1.verifyToken, user_controller_1.getDownline);
router.get('/balance', auth_middleware_1.verifyToken, user_controller_1.getBalance);
router.get('/children', auth_middleware_1.verifyToken, user_controller_1.getHierarchyForUser);
router.get('/children/:userId', auth_middleware_1.verifyToken, user_controller_1.getHierarchyForUser);
exports.default = router;
