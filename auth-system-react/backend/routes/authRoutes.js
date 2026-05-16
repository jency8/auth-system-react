const express = require("express");
const router = express.Router();
const { register, login, refreshToken, logout, logoutAll, getMe, getSessions } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validateMiddleware");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many requests from this IP. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many refresh requests." },
});

router.post("/register",    authLimiter,    validateRegister, register);
router.post("/login",       authLimiter,    validateLogin,    login);
router.post("/refresh",     refreshLimiter,                   refreshToken);
router.post("/logout",      protect,                          logout);
router.post("/logout-all",  protect,                          logoutAll);
router.get("/me",           protect,                          getMe);
router.get("/sessions",     protect,                          getSessions);

module.exports = router;
