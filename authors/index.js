import express from "express";
import uniqid from "uniqid";
import { getAuthors, writeAuthors } from "../lib/fs-tools.js";

const authorsRouter = express.Router();

authorsRouter.get("/", async (req, res, next) => {
  try {
    const authors = await getAuthors();
    res.send(authors);
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:authorId", async (req, res, next) => {
  try {
    const authors = await getAuthors();
    const author = authors.find((author) => author._id === req.params.authorId);
    if (!author) {
      res.status(404).send({
        message: `Author with that id was not found! (${req.params.authorId})`,
      });
    }
    res.send(author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/", async (req, res, next) => {
  try {
    const { name, surname, email, dob, avatar } = req.body;

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

    const authors = await getAuthors();
    authors.push(author);
    await writeAuthors(authors);
    res.send(author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/:authorId", async (req, res, next) => {
  try {
    const authors = await getAuthors();
    const index = authors.findIndex(
      (author) => author._id === req.params.authorId
    );
    if (!index == -1) {
      res.status(404).send({
        message: `Author with that id was not found! (${req.params.authorId})`,
      });
    }
    const preEdit = authors[index];
    const afterEdit = {
      ...preEdit,
      ...req.body,
      updatedAt: new Date(),
    };
    authors[index] = afterEdit;

    await writeAuthors(authors);
    res.send(afterEdit);
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const authors = await getAuthors();

    const author = authors.find((author) => author._id === req.params.authorId);
    if (!author) {
      res.status(404).send({
        message: `Author with this id was not found! (${req.params.authorId})`,
      });
    }
    const remainingAuthors = authors.filter(
      (author) => author._id !== req.params.authorId
    );
    await writeAuthors(remainingAuthors);
    res.status(204).send();
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
