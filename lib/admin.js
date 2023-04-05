import createHttpError from "http-errors";

export const adminMiddleware = (req, res, next) => {
  if (req.author.role === "Admin") {
    next();
  } else {
    next(createHttpError(403, "Admin only endpoint!"));
  }
};
