import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Models from "../src/user/model/model";
import { IUser } from "../src/user/model/model"; // Import the IUser interface
import dotenv from "dotenv";
const { User } = Models;
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "satyasingh";
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


//   export const getUserId = async (authHeader: string): Promise<IUser | null> => {
    export const getUserId = async (req: Request): Promise<IUser | null> => {
    try {

    const authHeader = req.header("Authorization");
    if (!authHeader) {
        throw new Error("Unauthorized: No token provided");
    }
  
      // Extract token by stripping off "Bearer " prefix
      const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
  
      // Decode and verify the token
      const decoded = jwt.verify(token, SECRET_KEY) as DecodedToken;
  
      // Find the user based on the decoded token
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error("Unauthorized: User not found");
      }
      return user; // Return the user
    } catch (err) {
      console.error("Authentication error:", err);
      throw new Error("Unauthorized: Invalid token");
    }
  };
  