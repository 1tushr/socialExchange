import User from "../models/users.js";
import * as HttpStatusCodes from "../constants/httpStatusCode.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
const {
  HTTP_CREATED,
  HTTP_BAD_REQUEST,
  HTTP_UNAUTHORIZED,
  HTTP_INTERNAL_SERVER_ERROR,
} = HttpStatusCodes;
// SIGN UP FUNCTION
async function handleSignup(req, res) {
  try {
    const { firstname, username, email, password } = req.body;

    // Validate required parameters
    if (!firstname || !username || !email || !password) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "All fields are required" });
    }

    const userExists = await User.findOne({ email });

    if (!userExists) {
      const hashedPass = await bcrypt.hash(
        password,
        parseInt(process.env.SALT_ROUNDS)
      );
      const newUser = await User.create({
        firstname,
        username,
        email,
        password: hashedPass,
      });
      if (newUser) {
        let { password, ...userData } = newUser._doc;
        return res
          .status(HTTP_CREATED)
          .json({ message: "User created successfully", userData });
      }
    } else {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ error: "User already exists" });
    }
  } catch (error) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "An error occurred during user registration",
      details: error.message,
    });
  }
}

// LOGIN FUNCTION
async function handleLogin(req, res) {
  try {
    const { username, email, password } = req.body;

    // Validate required parameters
    if (!password || (!email && !username)) {
      return res.status(HTTP_BAD_REQUEST).json({
        error: "Invalid input. Please provide both email and password",
      });
    }

    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (!userExists) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "User doesn't exist. Please sign up" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      userExists.password
    );

    if (!isPasswordCorrect) {
      return res
        .status(HTTP_UNAUTHORIZED)
        .json({ message: "Incorrect password" });
    }

    // Successful login
    return res.status(200).json({
      message: "User logged in successfully",
      userExists: {
        _id: userExists._id,
        username: userExists.username,
        email: userExists.email,
      },
    });
  } catch (error) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "An error occurred during user login",
      details: error.message,
    });
  }
}

export { handleSignup, handleLogin };