import isVerified from "../middlewares/isVerified.js";
import express from "express";
import { createNewpost, updatePost } from "../controllers/posts.js";
const postRouter = express.Router();

//create post
postRouter.post("/createpost/:userid", isVerified, createNewpost);

//update post
postRouter.put("/updatepost/:postid", updatePost);
//get all post

//delete post

//like post

//dislike post

export default postRouter;
