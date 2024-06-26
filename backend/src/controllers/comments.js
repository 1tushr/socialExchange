// Import necessary modules
import {
  HTTP_CREATED,
  HTTP_NOT_FOUND,
  HTTP_BAD_REQUEST,
  HTTP_OK,
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
//Controller function to handle update comments
async function updateComment(req, res) {
  try {
    const { commentid } = req.params;
    const { text } = req.body;
    if (!commentid) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ message: "no comment found to update" });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      { _id: commentid },
      { text: text },
      { new: true }
    );
    res
      .status(HTTP_OK)
      .json({ message: "updated comment success", updatedComment });
  } catch (error) {
    console.error("Error in updating comment:", error);
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Error in updating comment" });
  }
}
//Controller function to handle get comments
async function getComments(req, res) {
  try {
    const { commentid } = req.params;
    const getComments = await Comment.findById(commentid);

    if (!getComments) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ message: "no comment found with this id " });
    } else {
      const { text } = getComments;
      res.status(HTTP_OK).json({ message: "comment fetched success", text });
    }
  } catch (error) {
    console.error("Error in getting comment:", error);
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Error in getting comment" });
  }
}

async function deleteComment(req, res) {
  try {
    const { commentid } = req.params;
    const commentToDelete = await Comment.findById(commentid);

    if (!commentToDelete) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ message: "Not comment found for deletion" });
    }
    await commentToDelete.deleteOne();
    res.status(HTTP_OK).json({ message: "comment deleted success" });
  } catch (error) {
    console.error(error);
    return res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Internal server error" });
  }
}
// Export the controller function
export { postComment, updateComment, getComments, deleteComment };
