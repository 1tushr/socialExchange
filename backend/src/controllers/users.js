import User from "../models/users.js";
import Post from "../models/post.js";
import Comment from "../models/comments.js";
import * as HttpStatusCodes from "../constants/httpStatusCode.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const {
  HTTP_OK,
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_CREATED,
  HTTP_NOT_FOUND,
} = HttpStatusCodes;

//function to get user
async function handleGetUser(req, res) {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "please provide a valid userid " });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "no user found with provided userId" });
    } else {
      const { password, ...fetchedUser } = user._doc;
      res.status(HTTP_OK).json({ message: "userfetched", fetchedUser });
    }
  } catch (error) {
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: "Error occured during fetch", details: error.message });
  }
}

// function for update user
async function handleUpdateUser(req, res) {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    if (!updateData) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "No data provided for update" });
    }

    const userToupdate = await User.findById(userId);

    if (!userToupdate) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "no user found with provided userId" });
    }
    Object.assign(userToupdate, updateData);
    await userToupdate.save();
    const { password, ...updatedUser } = userToupdate._doc;
    res
      .status(HTTP_OK)
      .json({ message: "User data updated success", updatedUser });
  } catch (error) {
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: "Error occured during fetch", details: error.message });
  }
}

// function for follow user
async function handleFollowUser(req, res) {
  try {
    const { userId } = req.params;
    const userToFollowId = req.body;

    // Check if the provided user ID is the same as the user to follow ID
    if (userId.toString() === userToFollowId._id?.toString()) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Cannot follow yourself" });
    }

    // Fetch the user initiating the follow
    const user = await User.findById(userId);

    // Fetch the user to follow
    const userToFollow = await User.findById(userToFollowId);

    // Check if either user is not found
    if (!user || !userToFollow) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Invalid user ID provided for follow operation" });
    }

    //Check if user is already followed
    if (
      user.following.includes(userToFollowId._id) ||
      userToFollow.followers.includes(userId)
    ) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "You are already following this user" });
    }

    // Update the following and followers arrays
    user.following.push(userToFollow);
    userToFollow.followers.push(user._id);

    // Save changes to the database
    await user.save();
    await userToFollow.save();
    res.status(HTTP_OK).json({ message: "User followed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Error occurred during follow operation",
      details: error.message,
    });
  }
}

// function to unfollow user
async function handleUnfollowUser(req, res) {
  try {
    const { userId } = req.params;
    const userToUnfollowId = req.body;
    if (!userId || !userToUnfollowId) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "user Id is missing" });
    }
    if (userId.toString() === userToUnfollowId._id.toString()) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "you cannot unfollow yourself" });
    }
    const user = await User.findById(userId);
    const userToUnfollowData = await User.findById(userToUnfollowId);

    user.following = user.following.filter(
      (followedId) => followedId.toString() !== userToUnfollowId._id.toString()
    );
    // update the follower list of the unfollowed user also
    userToUnfollowData.followers = userToUnfollowData.followers.filter(
      (followerId) => followerId.toString() !== userId
    );

    await user.save();
    await userToUnfollowData.save();

    res.status(HTTP_OK).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Error occurred during follow operation",
      details: error.message,
    });
  }
}

// function to block user
async function handleBlockUser(req, res) {
  try {
    const { userId } = req.params;
    const blockUserId = req.body;

    const user = await User.findById(userId);
    const userToblockData = await User.findById(blockUserId);
    // check if userId and blockId provided or not
    if (!userId && blockUserId._id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "please provide the proper userId && blockUserId" });
    }

    //check if user already blocked or not

    if (user.blockList.includes(blockUserId._id)) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "User already blocked" });
    }

    //check if user is not trying to block its own id

    if (userId.toString() === blockUserId._id.toString()) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "cannot block yourself" });
    }
    // push the blockId in the block list
    user.blockList.push(blockUserId);

    // remove the blocked user from following list
    user.following = user.following.filter(
      (id) => id.toString() !== blockUserId._id.toString()
    );

    // remove the blocker user from follower list
    user.followers = user.followers.filter(
      (id) => id.toString() !== blockUserId._id.toString()
    );

    // remove the user from following list of blocker user also
    userToblockData.followers = userToblockData.followers.filter(
      (id) => id.toString() !== userId.toString()
    );

    // remove the user from follower list
    userToblockData.following = userToblockData.following.filter(
      (id) => id.toString() !== userId.toString()
    );

    //save the user finally
    await user.save();
    await userToblockData.save();

    // user blocked success
    res.status(HTTP_OK).json({ message: "user blocked successfully" });
  } catch (error) {
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Error occured in blocking the user",
      details: error.message,
    });
  }
}

//function to unblock user
async function handleUnblockUser(req, res) {
  try {
    const { userId } = req.params;
    const userToUnblockId = req.body;

    //check is userId and userToUnblockId is provided;
    if (!userId && userToUnblockId) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "please provide proper userId and userToUnblockId" });
    }
    //check if user is not trying to unblock its own id;
    if (userId === userToUnblockId._id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "you can not unlock yourself" });
    }

    const user = await User.findById(userId);
    const userToUnblockData = await User.findById(userToUnblockId._id);

    //check if user is not there in blockList
    if (user.blockList.includes(userToUnblockId._id)) {
      user.blockList = user.blockList.filter(
        (id) => id.toString() != userToUnblockData._id.toString()
      );
      await user.save();
      res.status(HTTP_OK).json({ message: "user unblocked sucessfully " });
    } else {
      res.status(HTTP_BAD_REQUEST).json({ message: "user is not blocked" });
    }
  } catch (error) {
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "error occured in unblocking the error",
      details: error.message,
    });
  }
}

//function to get blocked users
async function handleGetblockedUsers(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "please provide a valid userId" });
    }
    const user = await User.findById(userId).populate("blockList", [
      "username",
      "firstname",
      "email",
      "profilePhoto",
    ]);

    if (user) {
      const { blockList, ...data } = user;
      if (blockList.length > 0) {
        res
          .status(HTTP_OK)
          .json({ message: "blocked users are ", details: blockList });
      } else {
        return res.status(HTTP_OK).json({ message: "zero blocked users" });
      }
    } else {
      return res.status(HTTP_BAD_REQUEST).json({ message: "no user found " });
    }
  } catch (error) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "cannot fetch the blocked user",
      details: error.message,
    });
  }
}

//function to delete user
async function handleDeleteUser(req, res) {
  try {
    // Extract userId from request parameters
    const { userId } = req.params;

    // Find the user to be deleted
    const user = await User.findById(userId);

    // Update followers of the user to be deleted
    await User.updateMany(
      { _id: { $in: user.following } },
      { $pull: { followers: userId } }
    );

    // Delete posts created by the user
    await Post.deleteMany({ user: userId });

    // Delete comments created by the user
    await Comment.deleteMany({ user: userId });

    // Remove the user from comments in posts
    await Post.updateMany(
      { "comments.user": userId },
      { $pull: { comments: { user: userId } } }
    );

    // Remove the user from replies to comments
    await Comment.updateMany(
      { "replies.user": userId },
      { $pull: { replies: { user: userId } } }
    );

    // Remove likes from posts where the user liked
    await Post.updateMany({ likes: userId }, { $pull: { likes: userId } });

    // Remove likes from all posts
    await Post.updateMany({}, { $pull: { likes: userId } });

    // Remove likes from comments
    await Comment.updateMany({}, { $pull: { likes: userId } });

    // Remove likes from replies to comments
    await Comment.updateMany(
      { "replies.likes": userId },
      { $pull: { "replies.likes": userId } }
    );

    // Remove the user from replies to comments
    await Comment.updateMany(
      { "replies.user": userId },
      { $pull: { replies: { user: userId } } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(HTTP_OK).json({ message: "User deleted successfully" });
    res.redirect("/auth/login");
  } catch (error) {
    // Handle errors and return an error response
    console.error("Error deleting user:", error);
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Error deleting user",
      details: error.message,
    });
  }
}

//function to search user
async function handleSearchUser(req, res) {
  try {
    const { query } = req.params;
    if (!query || query.trim() === "") {
      return res.status(HTTP_BAD_REQUEST).json({
        message: "please provide either proper username or firstname",
      });
    }
    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(query, "i") } },
        { firstname: { $regex: new RegExp(query, "i") } },
      ],
    });

    if (!user) {
      return res.status(HTTP_NOT_FOUND).json({ message: "no user found." });
    } else {
      res.status(HTTP_OK).json({ message: "user found", user });
    }
  } catch (error) {
    console.error("Error while finding user:", error);
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: "Error while finding user", details: error.message });
  }
}

const generateFileUrl = (filename) => {
  return process.env.URL + `/uploads/${filename}`;
};
// function to update profile picture
async function handleUpdateProfile(req, res) {
  try {
    const { userId } = req.params;
    const { filename } = req.file;

    // Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(HTTP_BAD_REQUEST).json({ message: "Invalid user ID" });
    }

    // Use findByIdAndUpdate to simplify finding the user by its ID
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: generateFileUrl(filename) },
      { new: true }
    );

    if (!user) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Profile update failed - User not found" });
    }

    res.status(HTTP_OK).json({ message: "Profile update successful", user });
  } catch (error) {
    console.error("Error in handleUpdateProfile:", error);

    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", details: error.message });
  }
}

//function to update the cover photo
async function handleUpdateCover(req, res) {
  try {
    const { userId } = req.params;
    const { filename } = req.file;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Please provide the proper userId" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { coverPhoto: generateFileUrl(filename) },
      { new: true }
    );
    if (!user) {
      return res.status(HTTP_BAD_REQUEST).json({ message: "user not found" });
    }
    res.status(HTTP_OK).json({ message: "cover photo updated" });
  } catch (error) {
    console.error("Error in update cover photo:", error);

    return res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", details: error.message });
  }
}

export {
  handleGetUser,
  handleUpdateUser,
  handleFollowUser,
  handleUnfollowUser,
  handleBlockUser,
  handleUnblockUser,
  handleGetblockedUsers,
  handleDeleteUser,
  handleSearchUser,
  handleUpdateProfile,
  handleUpdateCover
};
