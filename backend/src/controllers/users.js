import User from "../models/users.js";
import * as HttpStatusCodes from "../constants/httpStatusCode.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const { HTTP_OK, HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR } =
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

export { handleGetUser, handleUpdateUser };
