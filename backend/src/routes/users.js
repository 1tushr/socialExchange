import express from "express";
import {
  handleGetUser,
  handleUpdateUser,
  handleFollowUser,
} from "../controllers/users.js";
import isVerified from "../middlewares/isVerified.js";

const userRouter = express.Router();

//getuser
userRouter.get("/getuser/:userId", isVerified, handleGetUser);

//update userdata
userRouter.post("/updateuser/:userId", isVerified, handleUpdateUser);

// follow user
userRouter.post("/followuser/:userId", isVerified, handleFollowUser);

//unfollow user
//block user
//unblock user
//delete user
export default userRouter;
