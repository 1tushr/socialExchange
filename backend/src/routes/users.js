import express from "express";
import {
  handleGetUser,
  handleUpdateUser,
  handleFollowUser,
  handleUnfollowUser,
  handleBlockUser,
  handleUnblockUser,
  handleGetblockedUsers,
  handleDeleteUser,
  handleSearchUser,
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
userRouter.post("/unblock/:userId", isVerified, handleUnblockUser);

//get blocked users
userRouter.get("/getblockedusers/:userId", isVerified, handleGetblockedUsers);

//delete user
userRouter.delete("/deleteUser/:userId", isVerified, handleDeleteUser);

//search user
userRouter.get("/serachuser/:query", handleSearchUser);
export default userRouter;
