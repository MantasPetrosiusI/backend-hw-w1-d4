import express from "express";
import authorsModel from "./model.js";
import createHttpError from "http-errors";
import { mquery } from "mongoose";
import passport from "passport";
import { JWTAuthMiddleware } from "../lib/jwt-tool.js";
import { createAccessToken } from "../lib/access.js";

const authorsRouter = express.Router();

authorsRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", " email"] })
);

authorsRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (request, response, next) => {
    try {
      response.redirect(
        `${process.env.FE_URL}?accessToken=${request.user.accessToken}`
      );
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new authorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const mQuery = q2m(req.query);
    const authors = await authorsModel.find(
      mQuery.criteria,
      mquery.options.fields
    );
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedAuthor = await authorsModel.findByIdAndUpdate(
      req.author._id,
      req.body,
      { new: true, runValidators: true }
    );
    res.send(updatedAuthor);
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await authorsModel.findOneAndDelete(req.author._id);
    req.status(204).send();
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:authorId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const author = await authorsModel.findById(req.params.authorId);
    if (author) {
      res.send(author);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/:authorId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedAuthor = await authorsModel.findByIdAndUpdate(
      req.params.authorId,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedAuthor) {
      res.send(updatedAuthor);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete(
  "/:authorId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const deletedAuthor = await authorsModel.findByIdAndDelete(
        req.params.authorId
      );
      if (deletedAuthor) {
        res.status(204).send();
      } else {
        next(
          createHttpError(
            404,
            `Author with id ${req.params.authorId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.post("/googleLogin", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const author = await authorsModel.checkCredentials(email, password);

    if (author) {
      const data = { _id: author._id, role: author.role };
      const accessToken = await createAccessToken(data);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Bad credentials."));
    }
  } catch (error) {
    next(error);
  }
});
export default authorsRouter;
