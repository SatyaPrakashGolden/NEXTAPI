import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

class Database {
  constructor() {
    this.db_connect();
  }

  async db_connect(): Promise<void> {
    try {
      const mongoUrl = process.env.MONGO_URL;
      if (!mongoUrl) throw new Error("MONGO_URL is not defined");

      await mongoose.connect(mongoUrl);

      console.log("Database connected successfully");
      mongoose.set("debug", true);
    } catch (err) {
      console.error("Database connection failed:", err);
      process.exit(1);
    }
  }
}

export default new Database();
