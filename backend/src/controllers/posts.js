import User from "../models/users.js";
import Post from "../models/post.js";
import {
  HTTP_BAD_REQUEST,
  HTTP_CREATED,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NOT_FOUND,
  HTTP_OK,
} from "../constants/httpStatusCode.js";
import mongoose from "mongoose";

async function createNewpost(req, res) {
  try {
    // Extract user ID from request parameters and caption from request body
    const { userid } = req.params;
    const { caption, image } = req.body;

    // Validate that userid is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userid)) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Invalid user ID format" });
    }

    // Find user by ID
    const user = await User.findById(userid);

    // Check if user exists
    if (!user) {
      // If user not found, respond with a bad request status and a message
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "No user found with the given ID" });
    }

    // Check if caption is provided
    if (!caption || caption.trim() === "") {
      // If caption is missing or empty, respond with a bad request status and a message
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Caption is required" });
    }

    const newPostData = { user, caption };
    if (image) {
      newPostData.image = image;
    }
    // If all conditions are met, create a new post with user and caption

    const newPost = await Post.create(newPostData);

    // Save the new post to the database
    await newPost.save();

    // Respond with a success status and a message
    res
      .status(HTTP_CREATED)
      .json({ message: "New post created successfully", newPost });
  } catch (error) {
    // If an error occurs during the process, handle it and respond with an error status
    console.error("Error creating post:", error);
    res.status(HTTP_BAD_REQUEST).json({ message: "Error creating post" });
  }
}

async function updatePost(req, res) {
  try {
    const { postid } = req.params;
    const { caption } = req.body;
    console.log(req.params);
    // Check if postId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Invalid post ID format" });
    }

    // Update the post and return the updated document
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postid },
      { caption: caption },
      { new: true } // Return the updated document
    );

    // Check if a post was found and updated
    if (!updatedPost) {
      // If no post was found with the provided postid, return a 400 Bad Request response
      return res.status(HTTP_BAD_REQUEST).json({ message: "No post found" });
    }

    // Return a 200 OK response with the updated post
    res
      .status(HTTP_OK)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    // Log any errors that occur during the update process
    console.error("Error updating post:", error);
    // Return a 400 Bad Request response with an error message
    res.status(HTTP_BAD_REQUEST).json({ message: "Error in updating post" });
  }
}

async function getAllPosts(req, res) {
  try {
    const { userid } = req.params;
    const user = await User.findById(userid);

    if (!user) {
      return res.status(HTTP_NOT_FOUND).json({ message: "User not found" });
    }

    const blockedUserIds = user.blockList.map((id) => id.toString());

    const posts = await Post.find({
      user: {
        $nin: blockedUserIds,
      },
    }).populate("user", "username profilePhoto ");

    console.log("posts", posts);
    res.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ error: "Internal Server Error" });
  }
}
export { createNewpost, updatePost, getAllPosts };
