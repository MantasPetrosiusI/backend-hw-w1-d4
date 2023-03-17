import express from "express";
import uniqid from "uniqid";
import { sendsRegistrationEmail } from "../lib/email-tools.js";
import { getAuthors, writeAuthors } from "../lib/fs-tools.js";
import authorsModel from "./model.js";

const authorsRouter = express.Router();

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await authorsModel.find();
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const author = await authorsModel.findById(req.params.authorId);
    if (author) {
      res.send(author);
    } else {
      res.status(404).send({
        message: `Author with that id was not found! (${req.params.authorId})`,
      });
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = authorsModel(req.body);
    const { _id } = newAuthor.save();
    await sendsRegistrationEmail(req.body.email);
    res.send(_id);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/:authorId", async (req, res, next) => {
  try {
    const author = await authorsModel.findByIdAndUpdate(
      req.params.authorId,
      req.body,
      { new: true, runValidators: true }
    );
    if (author) {
      res.send(author);
    } else {
      res.status(404).send({
        message: `Author with that id was not found! (${req.params.authorId})`,
      });
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const author = await authorsModel.findByIdAndUpdate(req.params.authorId);
    if (author) {
      res.status(204).send(`Deleted!`);
    } else {
      res.status(404).send({
        message: `Author with that id was not found! (${req.params.authorId})`,
      });
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
