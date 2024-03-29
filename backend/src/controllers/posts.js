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
    user.posts.push(newPost._id);
    await user.save();
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
async function deletePost(req, res) {
  try {
    const { postid } = req.params;
    const postToDelete = await Post.findById(postid);
    if (!postToDelete) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ message: "no post found for this id to delete" });
    }
    const user = await User.findById(postToDelete.user);
    if (!user) {
      return res.status(HTTP_NOT_FOUND).json({ message: "no user found" });
    }
    user.posts = user.posts.filter(
      (postid) => postid.toString() !== postToDelete._id.toString()
    );
    await user.save();
    await postToDelete.deleteOne();
    res.status(HTTP_OK).json({ message: "post deleted successfully" });
  } catch (error) {
    console.error("Error in deleting the post:", error);
    res
      .status(HTTP_BAD_REQUEST)
      .json({ message: "Error in deleting the post" });
  }
}
async function likepost(req, res) {
  try {
    const { postid } = req.params;
    console.log("postid", postid);
    const postToLike = await Post.findById(postid);
    if (!postToLike) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ message: "no post found to like" });
    }

    const userid = req.locals._id;

    if (!userid) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ message: "you are not logged in" });
    }
    if (
      postToLike.likes.map((id) => id.toString()).includes(userid.toString())
    ) {
      return res
        .status(HTTP_INTERNAL_SERVER_ERROR)
        .json({ message: "post is already liked" });
    }
    postToLike.likes.push(userid);
    return res.status(HTTP_OK).json({ message: "post liking success" });
  } catch (error) {
    console.error("Error in liking the post:", error);
    res.status(HTTP_BAD_REQUEST).json({ message: "Error in liking the post" });
  }
}
async function dislikepost(req, res) {
  try {
    const { postid } = req.params;
    const postToDislike = await Post.findById(postid);
    if (!postToDislike) {
      return res
        .status(HTTP_NOT_FOUND)
        .json({ message: "no post found to dislike" });
    }
    const userid = req.locals._id;
    postToDislike.likes = postToDislike.likes.filter(
      (id) => id.toString() != userid.toString()
    );
    await postToDislike.save();
    return res.status(HTTP_OK).json({ message: "photo disliking success" });
  } catch (error) {
    console.error("Error in disliking the post:", error);
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: "Error in disliking the post" });
  }
}

export {
  createNewpost,
  updatePost,
  getAllPosts,
  deletePost,
  likepost,
  dislikepost,
};
