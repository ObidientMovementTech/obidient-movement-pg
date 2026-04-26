import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies or Authorization header
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

    // Use the correct field for user ID based on how generateToken creates tokens
    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Email verification required",
        emailVerified: false,
      });
    }

    // Set user ID in request object - use the same field structure across all middleware
    req.userId = userId;
    // IMPORTANT: Set the entire user object so isAdmin middleware can check the role
    req.user = user;
    next();
  } catch (error) {
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
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: "Admin access only - User not found in request" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

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

// Alias for protect - used in onboarding routes
export const verifyToken = protect;

/**
 * Optional auth — attaches req.user if a valid token is present, but does NOT
 * reject the request when no token or an invalid token is provided.
 * Use for endpoints where authenticated users get extra data (e.g. userReaction)
 * but unauthenticated users still get the public response.
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies['cu-auth-token']) {
    token = req.cookies['cu-auth-token'];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id || decoded.userId;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        req.userId = userId;
        req.user = user;
      }
    }
  } catch {
    // Invalid token — continue as unauthenticated
  }

  next();
};

// Role-based authorization middleware
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ 
        message: "Access denied - User not authenticated" 
      });
    }

    // Check if user's role or designation is in the allowed list
    const userRole = req.user.role;
    const userDesignation = req.user.designation;

    const isAuthorized = 
      allowedRoles.includes(userRole) || 
      allowedRoles.includes(userDesignation) ||
      userRole === 'admin'; // Admins have access to everything

    if (!isAuthorized) {
      console.log(
        `[AUTH] Access denied for user ${req.user.email}. Role: ${userRole}, Designation: ${userDesignation}, Required: ${allowedRoles.join(', ')}`
      );
      return res.status(403).json({ 
        message: "Access denied - Insufficient permissions",
        required: allowedRoles,
        current: userDesignation || userRole
      });
    }

    console.log(`[AUTH] Authorization successful for ${req.user.email}`);
    next();
  };
};
