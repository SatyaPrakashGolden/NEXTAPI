import mongoose, { Schema, Document } from "mongoose";

// Task Submission Interface
interface ITaskSubmission extends Document {
  userId: mongoose.Types.ObjectId;  // Reference to the User model
  taskId: mongoose.Types.ObjectId;  // Reference to the Task model
  taskAnswer: string;  // The answer submitted for the task
  submittedAt: Date;
  status: string;  // Status of submission (e.g., "submitted", "completed")
}

// User Interface
export  interface IUser extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  userName: string;  // Renamed to match the schema
  name: string;
  email:String;
  mobileNumber: string;
  country: string;
  password: string;
  roleId: number;
  totalTaskAssign: mongoose.Types.ObjectId[];  // Corrected to reference task IDs
}

// Task Interface
interface ITask extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  status: string;  // Status of the task (e.g., "submitted", "Pending")
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Task Submission Schema
const taskSubmissionSchema: Schema<ITaskSubmission> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoldenUser",  // Reference to the User model
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoldenTask",  // Reference to the Task model
      required: true,
    },
    taskAnswer: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: ["submitted", "completed"],  // Example statuses
      default: "submitted",
    },
  },
  {
    timestamps: true,  // Automatically adds createdAt and updatedAt fields
  }
);

// Task Schema
const taskSchema: Schema<ITask> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoldenUser",  // Reference to the User model
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["submitted", "Pending"],  // Example statuses
      default: "Pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// User Schema
const userSchema: Schema<IUser> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    mobileNumber: {
      type: String
    },
    country: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    roleId: {
      type: Number,
      required: true,
      default: 5,
    },
    totalTaskAssign: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GoldenTask", // Reference to the Task model
      },
    ],
  },
  {
    timestamps: true,  // Automatically adds createdAt and updatedAt fields
  }
);

// Create Models
const Task = mongoose.model<ITask>("GoldenTask", taskSchema);
const User = mongoose.model<IUser>("GoldenUser", userSchema);
const TaskSubmission = mongoose.model<ITaskSubmission>("GoldenTaskSubmission", taskSubmissionSchema);

// Export Models
export default { User, Task, TaskSubmission };
