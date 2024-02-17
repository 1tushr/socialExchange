
import dotenv from "dotenv";
import express from "express";
import connectDb from "../backend/src/config/database.js";
dotenv.config();
const app = express();

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
