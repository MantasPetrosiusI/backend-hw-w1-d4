import createHttpError from "http-errors";
import atob from "atob";
import authorsSchema from "../authors/model.js";

export const basicAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(401, "Please provide credentials in Authorization header")
    );
  } else {
    const encodedCredentials = req.headers.authorization.replace("Basic ", "");

    const credentials = atob(encodedCredentials);
    const [email, password] = credentials.split(":");

    const author = await authorsSchema.checkCredentials(email, password);

    if (author) {
      req.author = author;
      next();
    } else {
      next(createHttpError(401, "Bad credentials!"));
    }
  }
};
