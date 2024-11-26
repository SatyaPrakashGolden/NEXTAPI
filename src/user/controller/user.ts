import { Request, Response } from "express";
import Models from "../model/model";
const { User, Task,TaskSubmission } = Models;
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {getUserId} from '../../../middleware/getUserId'
import mongoose from 'mongoose';
require('dotenv').config();




export const AllPendingTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await getUserId(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const { key } = req.query;

    // Build search query if a key is provided
    const searchQuery = key && typeof key === 'string'
      ? {
          $or: [
            { title: { $regex: key.trim(), $options: 'i' } },
            { description: { $regex: key.trim(), $options: 'i' } },
            { status: { $regex: key.trim(), $options: 'i' } },
          ]
        }
      : {};

    // Fetch only the tasks with "Pending" status for the authenticated user
    const userAllPendingTasks = await Task.find({
      userId: user.userId,
      status: "Pending", // Filter tasks where the status is "Pending"
      ...searchQuery, // Apply search query if provided
    });

    // Check if tasks are found
    if (!userAllPendingTasks || userAllPendingTasks.length === 0) {
      return res.status(404).json({ message: "No pending tasks found for this user" });
    }

    // Return the pending tasks with additional details like total count
    return res.status(200).json({
      message: "Pending tasks retrieved successfully",
      totalTask: userAllPendingTasks.length,
      tasks: userAllPendingTasks,
    });
  } catch (error: any) {
    console.error("Error fetching pending tasks:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};


export const AllSubmittedTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Authenticate the user
    const user = await getUserId(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const { key } = req.query;

    // Build search query if a key is provided
    const searchQuery = key && typeof key === 'string'
      ? {
          $or: [
            { title: { $regex: key.trim(), $options: 'i' } },
            { description: { $regex: key.trim(), $options: 'i' } },
            { status: { $regex: key.trim(), $options: 'i' } },
          ]
        }
      : {};

    // Fetch only the tasks with "submitted" status for the authenticated user
    const userAllSubmittedTasks = await Task.find({
      userId: user.userId,
      status: "submitted",  // Filter tasks where the status is "submitted"
      ...searchQuery, // Apply search query if provided
    });

    // Check if tasks are found
    if (!userAllSubmittedTasks || userAllSubmittedTasks.length === 0) {
      return res.status(404).json({ message: "No submitted tasks found for this user" });
    }

    // Return the submitted tasks with additional details like total count
    return res.status(200).json({
      message: "Submitted tasks retrieved successfully",
      totalTask: userAllSubmittedTasks.length,
      tasks: userAllSubmittedTasks,
    });
  } catch (error: any) {
    console.error("Error fetching submitted tasks:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};



export const taskStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Authenticate the user
    const user = await getUserId(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Fetch all tasks for the user
    const userAllTasks = await Task.find({ userId: user.userId });

    // Initialize counts
    let submittedCount = 0;
    let pendingCount = 0;

    // Loop through all tasks and count by status
    for (let i = 0; i < userAllTasks.length; i++) {
      const task = userAllTasks[i];
      if (task.status === "submitted") {
        submittedCount++;
      } else if (task.status === "Pending") {
        pendingCount++;
      }
    }

    // Return the status counts
    return res.status(200).json({
      message: "Task statuses retrieved successfully",
      taskCounts: {
        totalTask:submittedCount+pendingCount,
        submitted: submittedCount,
        pending: pendingCount,
      },
    });
  } catch (error: any) {
    console.error("Error fetching task statuses:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const taskStatusPercentage = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Authenticate the user
    const user = await getUserId(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Fetch all tasks for the user
    const userAllTasks = await Task.find({ userId: user.userId });

    // Initialize counts
    let submittedCount = 0;
    let pendingCount = 0;

    // Loop through all tasks and count by status
    for (let i = 0; i < userAllTasks.length; i++) {
      const task = userAllTasks[i];
      if (task.status === "submitted") {
        submittedCount++;
      } else if (task.status === "Pending") {
        pendingCount++;
      }
    }

    // Calculate total tasks count
    const totalTasks = userAllTasks.length;

    // Avoid division by zero
    if (totalTasks === 0) {
      return res.status(200).json({
        message: "No tasks found for the user",
        taskCounts: {
          percenComplte: "0.00",
          percenPending: "0.00",
        },
      });
    }

    // Calculate completion and pending percentages
    const percenComplte = ((submittedCount / totalTasks) * 100).toFixed(2);
    const percenPending = ((pendingCount / totalTasks) * 100).toFixed(2);

    return res.status(200).json({
      message: "Task statuses retrieved successfully",
      taskCounts: {
        percenComplte: percenComplte,
        percenPending: percenPending,
      },
    });
  } catch (error: any) {
    console.error("Error fetching task statuses:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};


export const submitTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Authenticate the user
    const user = await getUserId(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Extract task answer and task ID
    const { taskAnswer } = req.body;
    const { taskId } = req.query;

    if (!taskAnswer) {
      return res.status(400).json({ error: "Task answer is required" });
    }

    if (!taskId || typeof taskId !== "string") {
      return res.status(400).json({ error: "Task ID is required and must be a string" });
    }

    // Find the task assigned to the user
    const getTask = await Task.findOne({ _id: taskId, userId: user.userId });

    if (!getTask) {
      return res.status(404).json({ error: "Task not found or not assigned to this user" });
    }

    if (getTask.status === "submitted") {
      return res.status(400).json({ error: "Task has already been completed" });
    }

    // Update task status to 'completed'
    getTask.status = "submitted";
    await getTask.save();

    // Create a task submission record
    const taskSubmission = new TaskSubmission({
      userId: user.userId,
      taskId,
      taskAnswer,
      status: "submitted",
    });

    await taskSubmission.save();

    // Return success response
    return res.status(200).json({
      message: "Task submitted successfully",
      submission: taskSubmission,
    });
  } catch (err: any) {
    console.error("Error submitting task:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await getUserId(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    const { taskId } = req.query;
    if (!taskId || typeof taskId !== "string") {
      return res.status(400).json({ error: "Task ID is required and must be a string" });
    }
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: user.userId,
    });
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found or you do not have permission to delete this task" });
    }
    return res.status(200).json({
      message: "Task deleted successfully",
      data: deletedTask,
    });
  } catch (err: any) {
    console.error("Error deleting task:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await getUserId(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    const { taskId } = req.query;
    const updateData = req.body;
    if (!taskId || typeof taskId !== "string") {
      return res.status(400).json({ error: "Task ID is required and must be a string" });
    }
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: user.userId }, // Ensure the task belongs to the authenticated user
      updateData,
      { new: true, runValidators: true } // Return the updated task and run schema validations
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found or you do not have permission to update this task" });
    }

    // Return success response
    return res.status(200).json({
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (err: any) {
    console.error("Error updating task:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
};

export const getTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = await getUserId(req); 
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    // Get the search key from query
    const { key } = req.query;

    // Ensure 'key' is a string before calling trim
    const searchQuery = key && typeof key === 'string'
      ? {
          $or: [
            { title: { $regex: key.trim(), $options: 'i' } },
            { description: { $regex: key.trim(), $options: 'i' } },
            { status: { $regex: key.trim(), $options: 'i' } },
          ]
        }
      : {};

    // Fetch tasks using search query and userId
    const allTasks = await Task.find({
      userId: user.userId,
      ...searchQuery // Apply search query if it exists
    });

    // Check if no tasks were found
    if (!allTasks || allTasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user" });
    }

    return res.status(200).json({
      message: "Tasks retrieved successfully",
      totalTask: allTasks.length,
      data: allTasks,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "An error occurred" });
  }
};


export const createTask = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { title, description, dueDate } = req.body;
    const user = await getUserId(req); 
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    if (!title || !description || !dueDate)    return res.status(400).json({ error: "All fields are required" });
    const newTask = new Task({
      userId:user.userId,
      title,
      description,
      dueDate,
      status: "Pending",
    });
    const savedTask = await newTask.save();
    const users = await User.find(); 
    const updatePromises = users.map(user => {
      return User.findByIdAndUpdate(
        user._id, 
        { $push: { totalTaskAssign: savedTask._id } },  
        { new: true } 
      );
    });
    await Promise.all(updatePromises);
    return res.status(201).json({ message: "Task created and assigned to all users", task: savedTask });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error});
  }
};

export const registerUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userName, name, email,mobileNumber, country, password } = req.body;

    if (!userName || !mobileNumber || !country || !password) {
      throw new Error("Required fields are missing.");
    }

    const existingUser = await User.findOne({ userName });
    const existingEmail = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }
    

    const hashedPassword = await bcrypt.hash(password, 10);
    

    const newUser = new User({
      userId: new mongoose.Types.ObjectId(),  
      userName,
      name,
      email,
      mobileNumber,
      country,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, userName: newUser.userName },
      process.env.SECRET_KEY || "satyasingh",
      { expiresIn: "40h" }
    );

    return res.status(201).json({
      message: "User registered successfully.",
      user: newUser,
      token,
    });
  } catch (error: any) {
    return res.status(400).json(error);
  }
};

export const loginUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body; 

    if (!email || !password) {
      return res.status(400).json({ message: "Email/Username and password are required." });
    }

    const user = await User.findOne({
      $or: [{ email: email }, { userName: email }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { userId: user._id, userName: user.userName },
      process.env.SECRET_KEY || "satyasingh",
      { expiresIn: "40h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      user: {
        userName: user.userName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        country: user.country,
      },
      token,
    });
  } catch (error: any) {
    return res.status(400).json(400);
  }
};



export const socialLogin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body; 

    if (!email ) {
      return res.status(400).json({ message: "Email/Username and password are required." });
    }
    const user = await User.findOne({ email: email });
    if (!user) throw("you have not register yet")
    const token = jwt.sign(
      { userId: user._id, userName: user.userName },
      process.env.SECRET_KEY || "satyasingh",
      { expiresIn: "40h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      user: {
        userName: user.userName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        country: user.country,
      },
      token,
    });
  } catch (error: any) {
    return res.status(400).json(400);
  }
};
