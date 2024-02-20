import express from "express";
import {
  handleSignup,
  handleLogin,
  handleLogout,
  handleUserFetch,
} from "../controllers/auth.js";
import isVerified from "../middlewares/isVerified.js";

const authRouter = express.Router();

//register
authRouter.post("/signup", handleSignup);

//login
authRouter.post("/login", handleLogin);

//logout
authRouter.get("/logout", handleLogout);

//fetch user
authRouter.get("/fetchuser", isVerified, handleUserFetch);

export default authRouter;
