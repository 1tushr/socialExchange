import User from "../models/users.js";
import * as HttpStatusCodes from "../constants/httpStatusCode.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const {
  HTTP_OK,
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
    if (userExists && isPasswordCorrect) {
      const { password, ...userLoggedIn } = userExists._doc;
      // Successful login
      const token = jwt.sign(
        { _id: userExists._id },
        process.env.SECRET_TOKEN,
        { expiresIn: process.env.EXPIRY_TIME }
      );
      res.cookie("token", token).status(HTTP_OK).json({
        message: "User logged in successfully",
        userLoggedIn,
      });
    }
  } catch (error) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "An error occurred during user login",
      details: error.message,
    });
  }
}
// LOGOUT FUNCTION
async function handleLogout(req, res) {
  try {
    if (!req.cookies.token) {
      return res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "no token to clear" });
    }
    return res
      .clearCookie("token", { sameSite: "none", secure: true })
      .status(HTTP_OK)
      .json({ message: "user logged out success" });
    res.redirect("/auth/login");
  } catch (error) {
    return res.status(HTTP_INTERNAL_SERVER_ERROR).json({
      error: "An error occurred during user logout",
      details: error.message,
    });
  }
}

//FETCH USER
async function handleUserFetch(req, res) {
  try {
    const userFetched = await User.findById({ _id: req.locals._id });
    const { password, ...fetched } = userFetched._doc;
    res.status(HTTP_OK).json({ message: "user fetched success", fetched });
  } catch (error) {
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: "user was not fetched", details: error.message });
  }
}
export { handleSignup, handleLogin, handleLogout, handleUserFetch };
