import express from "express";
import { handleGetUser, handleUpdateUser } from "../controllers/users.js";
import isVerified from "../middlewares/isVerified.js";

const userRouter = express.Router();

userRouter.get("/getuser/:userId", isVerified, handleGetUser);
userRouter.post("/updateuser/:userId", isVerified, handleUpdateUser);
export default userRouter;
