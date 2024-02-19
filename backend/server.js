
import dotenv from "dotenv";
import express from "express";
import connectDb from "../backend/src/config/database.js";
import authRouter from "./src/routes/auth.js";
dotenv.config();
const app = express();
app.use(express.json())
const startServer = async () => {
  try {
    await connectDb();

    app.listen(process.env.PORT, () => {
      console.log(`server up and running at port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Server start failed:", error.message);
    process.exit(1);
  }
};

startServer();


app.use ('/auth',authRouter);
