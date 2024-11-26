import express, { Request, Response } from "express";
const passport=require('passport')
import {  registerUser ,loginUser ,createTask,getTask,updateTask ,deleteTask,
    submitTask,taskStatus,AllPendingTask,AllSubmittedTask ,socialLogin,
    taskStatusPercentage} from '../controller/user';
let {authenticateUser} =require('../../../middleware/jwt.middleware')
const router = express.Router();



router.get("/AllPendingTask", async (req: Request, res: Response) => {
    await AllPendingTask(req, res);
});
router.get("/taskStatusPercentage", async (req: Request, res: Response) => {
    await taskStatusPercentage(req, res);
});

router.get("/AllSubmittedTask", async (req: Request, res: Response) => {
    await AllSubmittedTask(req, res);
});

router.post("/submitTask", async (req: Request, res: Response) => {
    await submitTask(req, res);
});
router.post("/registerUser", async (req: Request, res: Response) => {
    await registerUser(req, res);
});

router.delete("/deleteTask", async (req: Request, res: Response) => {
    await deleteTask(req, res);
});

router.put("/updateTask", async (req: Request, res: Response) => {
    await updateTask(req, res);
});


router.post("/loginUser",async (req: Request, res: Response) => {
    await loginUser(req, res);
});

router.post("/socialLogin",async (req: Request, res: Response) => {
    await socialLogin(req, res);
});


router.post("/createTask", authenticateUser,async (req: Request, res: Response) => {
    await createTask(req, res);
});

router.get("/getTask", authenticateUser,async (req: Request, res: Response) => {
    await getTask (req, res);
});
router.get("/taskStatus", authenticateUser,async (req: Request, res: Response) => {
    await taskStatus (req, res);
});



export default router;
