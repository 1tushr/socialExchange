import express from "express";
import postComment from "../controllers/comments.js";
const commentsRouter = express.Router();

//post comment
commentsRouter.post("/postcomment/:postid", postComment);
//update comment
// commentsRouter.put("/updatecomment:commentid", updateComment);
//delete comment
// commentsRouter.delete("/deletecomment:commentid", deleteComment);
//get comment
// commentsRouter.get("getcomments:commentid", getComments);
export default commentsRouter;
