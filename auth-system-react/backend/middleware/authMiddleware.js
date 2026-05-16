const { verifyAccessToken } = require("../config/jwt");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select("-password -refreshTokens");

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Account has been deactivated." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Access token expired. Please refresh.", code: "TOKEN_EXPIRED" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token." });
    }
    next(error);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(" or ")}` });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
