import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Models from "../src/user/model/model";
import { IUser } from "../src/user/model/model"; // Import the IUser interface
import dotenv from "dotenv";
const { User } = Models;
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "satyasingh";

// Define the DecodedToken interface
interface DecodedToken {
  userId: string;  // Changed from 'id' to 'userId'
}

// Extend the Request interface with the user property
declare global {
  namespace Express {
    interface Request {
      user?: IUser | null; // Ensure user is typed as IUser
    }
  }
}

// Middleware function to authenticate the user
export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Extract token by stripping off "Bearer " prefix
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

    // Decode and verify the token
    const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;

    // Find the user based on the decoded token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    // console.log("0-------------------->",user)
    // Attach the user to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
