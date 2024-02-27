import User from "../models/users.js";
import * as HttpStatusCodes from "../constants/httpStatusCode.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR, HTTP_CREATED } =
  HttpStatusCodes;

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
    const {userId} = req.params;
    const blockUserId = req.body;

    const user = await User.findById(userId);
    const userToblockData = await User.findById(blockUserId);

    if (!userId && blockUserId._id) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "please provide the proper userId && blockUserId" });
    }
    if (user.blockList.includes(blockUserId._id)) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "User already blocked" });
    }

    if (userId.toString() === blockUserId._id.toString()) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "cannot block yourself" });
    }

    user.blockList.push(blockUserId);
    user.following=user.following.filter((id) => id.toString() !== blockUserId._id.toString());
    user.followers=user.followers.filter((id) => id.toString() !== blockUserId._id.toString());
    userToblockData.followers= userToblockData.followers.filter((id) => id.toString() !== userId.toString());
    userToblockData.following= userToblockData.following.filter((id) => id.toString() !== userId.toString());
    await user.save();
    await userToblockData.save();
    res.status(HTTP_OK).json({ message: "user blocked successfully" });
  } catch (error) {
    res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      message: "Error occured in blocking the user",
      details: error.message,
    });
  }
}
export {
  handleGetUser,
  handleUpdateUser,
  handleFollowUser,
  handleUnfollowUser,
  handleBlockUser,
};
