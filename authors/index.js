import express from "express";
import uniqid from "uniqid";
import { getAuthors, writeAuthors } from "../lib/fs-tools.js";
import authorsModel from "./model.js";
import createHttpError from "http-errors";
import { basicAuthMiddleware } from "../lib/basicUser.js";
import { adminMiddleware } from "../lib/admin.js";
import { mquery } from "mongoose";

const authorsRouter = express.Router();

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = new authorsModel(req.body);
    const { _id } = await newAuthor.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/", async (req, res, next) => {
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

authorsRouter.get("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/me", basicAuthMiddleware, async (req, res, next) => {
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

authorsRouter.delete("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    await authorsModel.findOneAndDelete(req.author._id);
    req.status(204).send();
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:authorId", basicAuthMiddleware, async (req, res, next) => {
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

authorsRouter.put("/:authorId", async (req, res, next) => {
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

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const deletedAuthor = await authorsModel.findByIdAndDelete(
      req.params.authorId
    );
    if (deletedAuthor) {
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/checkEmail", async (req, res, next) => {
  try {
    const { name, surname, email, dob, avatar } = req.body;
    const authors = await getAuthors();
    console.log(email);
    const index = authors.findIndex((author) => author.email === email);
    console.log(index);
    if (index === -1) {
      const author = {
        _id: uniqid(),
        name,
        surname,
        email,
        dob,
        avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      authors.push(author);
      await writeAuthors(authors);
      res.send(author);
    } else {
      res.status(404).send({ message: `Matching email found!` });
    }
  } catch (error) {
    next(error);
  }
});
export default authorsRouter;
