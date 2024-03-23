// Import necessary modules
import {
  HTTP_CREATED,
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST,
} from "../constants/httpStatusCode.js";
import Comment from "../models/comments.js";
import Post from "../models/post.js";

// Controller function to handle posting a comment
async function postComment(req, res) {
  try {
    // Extract postid and text from request parameters and body
    const { postid } = req.params;
    const { text } = req.body;

    // Find the post to comment on
    const postToComment = await Post.findById(postid);

    // If no post is found, respond with HTTP 404 Not Found
    if (!postToComment) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ message: "No post found to comment" });
    }

    // Create data for the new comment
    const newCommentData = {
      user: postToComment.user,
      post: postid,
      text,
    };

    // Create a new comment
    const newComment = await Comment.create(newCommentData);

    // Save the new comment
    await newComment.save();

    // Add the new comment's ID to the post's comments array
    postToComment.comments.push(newComment._id);

    // Save the post with the updated comments array
    await postToComment.save();

    // Respond with HTTP 201 Created
    return res
      .status(HTTP_CREATED)
      .json({ message: "Posted comment successfully" });
  } catch (error) {
    // If an error occurs during the process, log it and respond with an error status
    console.error("Error creating comment:", error);
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Error creating comment" });
  }
}

// Export the controller function
export default postComment;
