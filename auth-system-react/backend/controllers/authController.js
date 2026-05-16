const User = require("../models/User");
const { generateTokenPair, verifyRefreshToken } = require("../config/jwt");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered. Please login." });
    }
    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken, expiresAt } = generateTokenPair(user);
    user.refreshTokens.push({ token: refreshToken, expiresAt, userAgent: req.headers["user-agent"], ip: req.ip });
    user.lastLogin = new Date();
    await user.save();
    res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(201).json({ success: true, message: "Registration successful!", data: { user: user.toPublicJSON(), accessToken, expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" } });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });
    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ success: false, message: `Account locked. Try again in ${lockTime} minute(s).` });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: "Account deactivated. Contact support." });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      const remaining = 5 - (user.loginAttempts + 1);
      return res.status(401).json({ success: false, message: `Invalid credentials. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : "Account locked."}` });
    }
    if (user.loginAttempts > 0) await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
    await user.cleanExpiredTokens();
    if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
    const { accessToken, refreshToken, expiresAt } = generateTokenPair(user);
    user.refreshTokens.push({ token: refreshToken, expiresAt, userAgent: req.headers["user-agent"], ip: req.ip });
    user.lastLogin = new Date();
    await user.save();
    res.cookie("refreshToken", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ success: true, message: "Login successful!", data: { user: user.toPublicJSON(), accessToken, expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" } });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "Refresh token not found." });
    let decoded;
    try { decoded = verifyRefreshToken(token); }
    catch { return res.status(401).json({ success: false, message: "Invalid or expired refresh token. Please login again.", code: "REFRESH_TOKEN_INVALID" }); }
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: "User not found." });
    const storedToken = user.refreshTokens.find((t) => t.token === token);
    if (!storedToken) {
      user.refreshTokens = [];
      await user.save();
      return res.status(401).json({ success: false, message: "Token reuse detected. All sessions revoked. Please login again." });
    }
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
    const { accessToken, refreshToken: newRefreshToken, expiresAt } = generateTokenPair(user);
    user.refreshTokens.push({ token: newRefreshToken, expiresAt, userAgent: req.headers["user-agent"], ip: req.ip });
    await user.save();
    res.cookie("refreshToken", newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ success: true, message: "Token refreshed successfully.", data: { accessToken, expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" } });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ success: false, message: "Token refresh failed." });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token && req.user) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: { token } } });
    }
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Logout failed." });
  }
};

const logoutAll = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokens: [] } });
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    return res.status(200).json({ success: true, message: "Logged out from all devices." });
  } catch (error) {
    console.error("Logout all error:", error);
    return res.status(500).json({ success: false, message: "Operation failed." });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({ success: true, data: { user: req.user.toPublicJSON() } });
};

const getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const sessions = user.refreshTokens.map((t) => ({
      createdAt: t.createdAt,
      expiresAt: t.expiresAt,
      userAgent: t.userAgent,
      ip: t.ip,
    }));
    return res.status(200).json({ success: true, data: { sessions, count: sessions.length } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch sessions." });
  }
};

module.exports = { register, login, refreshToken, logout, logoutAll, getMe, getSessions };
