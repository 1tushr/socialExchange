import express from "express";
import {
  handleGetUser,
  handleUpdateUser,
  handleFollowUser,
  handleUnfollowUser,
  handleBlockUser,
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
userRouter.post("/unfollow/:userId", isVerified, handleUnfollowUser);

//block user
userRouter.post("/block/:userId", isVerified, handleBlockUser);
//unblock user

//delete user
export default userRouter;
