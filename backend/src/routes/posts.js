import isVerified from "../middlewares/isVerified.js";
import express from "express";
import {
  createNewpost,
  deletePost,
  dislikepost,
  getAllPosts,
  likepost,
  updatePost,
} from "../controllers/posts.js";
const postRouter = express.Router();

//create post
postRouter.post("/createpost/:userid", isVerified, createNewpost);
//update post
postRouter.put("/updatepost/:postid", updatePost);
//get all post
postRouter.get("/getallposts/:userid", getAllPosts);
//delete post
postRouter.delete("/deletepost/:postid", deletePost);
//like post
postRouter.post("/likepost/:postid", isVerified, likepost);
//dislike post
postRouter.post("/dislikepost/:postid", isVerified, dislikepost);
export default postRouter;
