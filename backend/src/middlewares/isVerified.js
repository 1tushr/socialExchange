import * as HttpStatusCodes from "../constants/httpStatusCode.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const { HTTP_BAD_REQUEST, HTTP_INTERNAL_SERVER_ERROR } = HttpStatusCodes;

const isVerified = (req, res, next) => {
  const token = req.cookies.token;
  try {
    const isAuth = jwt.verify(token, process.env.SECRET_TOKEN);
    if (isAuth) {
      req.locals = isAuth;
      console.log(req.locals);
      next();
    } else {
      res
        .status(HTTP_BAD_REQUEST)
        .json({ message: "Invalid token, please login" });
    }
  } catch (error) {
    res
      .status(HTTP_INTERNAL_SERVER_ERROR)
      .json({ message: "user not authenticated, please login" });
  }
};

export default isVerified;
