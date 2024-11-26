import express from "express";
import dotenv from "dotenv";
import userRouter from './src/user/routes/route'; 
import Database from './database/db'; 
import cors from 'cors'; // Import CORS


dotenv.config();

const app = express();
const port = process.env.PORT;

// Middleware to parse JSON body
app.use(express.json());



// Enable CORS with default settings (allows all origins)
app.use(cors()); // You can pass options to customize CORS if needed

Database; // Assuming this connects to your DB

// Use userRouter for /api/user routes
app.use('/api/user', userRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
