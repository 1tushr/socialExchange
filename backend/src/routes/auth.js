import express from "express";
import {
  handleSignup,
  handleLogin,
  handleLogout,
} from "../controllers/auth.js";

const authRouter = express.Router();

//register

authRouter.post("/signup", handleSignup);

//login
authRouter.post("/login", handleLogin);
//logout
authRouter.get("/logout", handleLogout);
//fetch user
export default authRouter;
