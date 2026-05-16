const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m",
    issuer: "auth-system",
    audience: "auth-system-client",
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d",
    issuer: "auth-system",
    audience: "auth-system-client",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
    issuer: "auth-system",
    audience: "auth-system-client",
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: "auth-system",
    audience: "auth-system-client",
  });
};

const getRefreshTokenExpiry = () => {
  const expiry = process.env.JWT_REFRESH_EXPIRY || "7d";
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1));
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return new Date(Date.now() + value * (multipliers[unit] || 86400000));
};

const generateTokenPair = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user._id });
  return { accessToken, refreshToken, expiresAt: getRefreshTokenExpiry() };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  getRefreshTokenExpiry,
};
