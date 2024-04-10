import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "../backend/src/config/database.js";
import authRouter from "./src/routes/auth.js";
import userRouter from "./src/routes/users.js";
import postRouter from "./src/routes/posts.js";
import commentsRouter from "./src/routes/comments.js";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./src/swagger.json" assert { type: "json" };

dotenv.config();
const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());
app.use(cookieParser());
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

app
  .use("/auth", authRouter)
  .use("/user", userRouter)
  .use("/post", postRouter)
  .use("/comments", commentsRouter);
