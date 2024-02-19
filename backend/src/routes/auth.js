import express from "express";
import { handleSignup, handleLogin } from "../controllers/auth.js";

const authRouter = express.Router();

//register

authRouter.post("/signup", handleSignup);

export default authRouter;
//login
authRouter.post("/login", handleLogin);
//logout

//fetch user
