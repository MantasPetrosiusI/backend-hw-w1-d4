import createHttpError from "http-errors";
import { verifyAccessToken } from "./access.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(
        401,
        "Please provide Bearer Token in Authorization header"
      )
    );
  } else {
    const accessToken = req.headers.authorization.split(" ")[1];
    try {
      const payload = await verifyAccessToken(accessToken);
      req.author = { _id: payload._id, role: payload.role };
      next();
    } catch (error) {
      console.log(error);
      next(createHttpError(401, "Token not valid!"));
    }
  }
};
