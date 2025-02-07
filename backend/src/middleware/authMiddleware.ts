import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UNAUTHORIZED } from "../constants/http";
import logger from "../utils/logger"; 

const JWT_SECRET = process.env.JWT_SECRET || "my_secure_secret";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("Authenticating request");
  const token = req.cookies.token;
  if (!token) {
    logger.warn("Authentication failed: Token not provided");
    res
      .status(UNAUTHORIZED)
      .json({ error: "Unauthorized: token not provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };
    req.user = { id: decoded.id, email: decoded.email };
    logger.debug(`Authentication successful for user id: ${decoded.id}`);
    next();
  } catch (error) {
    logger.warn("Authentication failed: Invalid token", error);
    res.status(UNAUTHORIZED).json({ error: "Invalid token" });
    return;
  }
};
