import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies or Authorization header
  if (req.cookies && req.cookies["cu-auth-token"]) {
    token = req.cookies["cu-auth-token"];
    console.log("[VERCEL][AUTH] Found token in cookies");
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("[VERCEL][AUTH] Found token in Authorization header");
  }

  if (!token) {
    console.log("[VERCEL][AUTH] No token provided");
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    console.log("[VERCEL][AUTH] Verifying token...");

    // Important: Check what's in the token first to debug
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[VERCEL][AUTH] Decoded token:", decoded);

    // Use the correct field for user ID based on how generateToken creates tokens
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      console.error("[VERCEL][AUTH] No user ID found in token:", decoded);
      return res.status(401).json({ message: "Invalid token structure" });
    }

    const user = await User.findById(userId);

    if (!user) {
      console.log("[VERCEL][AUTH] User not found with ID:", userId);
      return res.status(401).json({ message: "User not found" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      console.log(`[VERCEL][AUTH] User ${user.email} has unverified email`);
      return res.status(403).json({
        message: "Email verification required",
        emailVerified: false,
      });
    }

    console.log(`[VERCEL][AUTH] Authentication successful for user ${user.email}`);

    // Set user ID in request object - use the same field structure across all middleware
    req.userId = userId;
    // IMPORTANT: Set the entire user object so isAdmin middleware can check the role
    req.user = user;
    next();
  } catch (error) {
    console.error("[VERCEL][AUTH] Token verification error:", error.message);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Middleware that only checks authentication but doesn't require email verification
export const authenticateUser = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies["cu-auth-token"]) {
    token = req.cookies["cu-auth-token"];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use the correct field for user ID
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Set the userId but don't check email verification
    req.userId = userId;
    req.emailVerified = user.emailVerified;
    // Set the entire user object for consistency
    req.user = user;
    next();
  } catch (error) {
    console.error("[VERCEL][AUTH] Auth check error:", error.message);
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  console.log("[VERCEL][AUTH] Checking admin role. User:", req.user);

  if (!req.user) {
    console.log("[VERCEL][AUTH] req.user is missing in isAdmin middleware");
    return res.status(403).json({ message: "Admin access only - User not found in request" });
  }

  if (req.user.role !== "admin") {
    console.log(`[VERCEL][AUTH] User ${req.user.email} is not an admin. Role:`, req.user.role);
    return res.status(403).json({ message: "Admin access only" });
  }

  console.log(`[VERCEL][AUTH] Admin check passed for ${req.user.email}`);
  next();
};

export function isKYCVerified(req, res, next) {
  if (req.user && req.user.isKYCVerified) {
    return next();
  }
  return res
    .status(403)
    .json({
      message: "KYC verification required to perform this action.",
    });
}
