import express from "express";
import mongoose from "mongoose";
import createError from "http-errors";
import blogPostsModel from "./model.js";
import authorsModel from "../authors/model.js";
import commentsModel from "./commentsModel.js";
import { getBlogPosts, writeBlogPosts } from "../lib/fs-tools.js";
import {
  sendsCreatedPostEmail,
  sendsMailWithAttachment,
} from "../lib/email-tools.js";
import { asyncBlogPostsPDFGenerator } from "../lib/pdf-tools.js";
const blogPostsRouter = express.Router();

blogPostsRouter.get("/", async (req, res, next) => {
  const perPage = req.query.limit;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * perPage;

  try {
    const blogPosts = await blogPostsModel
      .find()
      .sort(req.query.sort)
      .skip(skip)
      .limit(perPage)
      .populate({ path: "author", select: "name surname" })
      .populate({ path: "comments", select: "text author" });

    if (req.query && req.query.title) {
      const foundBlogPosts = blogPosts.filter(
        (blogPost) => blogPost.title === req.query.title
      );
      res.send(foundBlogPosts);
    } else {
      res.send(blogPosts);
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await blogPostsModel
      .findById(req.params.blogPostId)
      .populate({ path: "author", select: "name surname" });
    res.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post("/", async (req, res, next) => {
  try {
    const blogPost = new blogPostsModel(req.body);
    const authors = await authorsModel.findById(req.body.author);
    const { _id } = await blogPost.save();
    const blogPostSend = await blogPostsModel
      .findById(_id)
      .populate({ path: "author", select: "name surname" })
      .populate({ path: "comments", select: "text author" });
    await sendsCreatedPostEmail(authors.email);

    res.status(201).send(blogPostSend);

    await asyncBlogPostsPDFGenerator(blogPostSend);
    await sendsMailWithAttachment(blogPostSend);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const blogPostToUpdate = await blogPostsModel.findByIdAndUpdate(
      req.params.blogPostId,
      req.body
    );
    const index = blogPosts.findIndex(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    if (!index == -1) {
      res.status(404).send({ message: `It's 404 you know what it means X)` });
    }
    blogPosts[index] = blogPostToUpdate;
    await writeBlogPosts(blogPosts);
    res.status(202).send(blogPostToUpdate);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const blogPostToDelete = await blogPostsModel.findByIdAndDelete(
      req.params.blogPostId
    );
    const remainingBlogPosts = blogPosts.filter(
      (blogPost) => blogPost.id === blogPostToDelete._id
    );
    await writeBlogPosts(remainingBlogPosts);
    res.status(204).send(`Deleted`);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

blogPostsRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPost = await blogPostsModel.findById(req.params.blogPostId);
    if (blogPost) {
      res.send(blogPost.comments);
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await blogPostsModel.findById(req.params.blogPostId);
      if (blogPost) {
        const comment = blogPost.comments.find(
          (comment) => comment._id.toString() === req.params.commentId
        );
        if (comment) {
          res.send(comment);
        } else {
          next(
            createError(
              404,
              `comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createError(
            404,
            `Blog Post with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const newComment = new commentsModel(req.body);
    const commentToInsert = { ...newComment.toObject() };
    const updatedBlogPost = await blogPostsModel.findByIdAndUpdate(
      req.params.blogPostId,
      { $push: { comments: commentToInsert } },
      { new: true, runValidators: true }
    );
    console.log(updatedBlogPost);
    if (updatedBlogPost) {
      res.send(updatedBlogPost.comments);
    } else {
      next(
        createError(
          404,
          `Blog Post with id ${req.params.blogPostId} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPost = await blogPostsModel.findById(req.params.blogPostId);
      if (blogPost) {
        const index = blogPost.comments.findIndex(
          (comment) => comment._id.toString() === req.params.commentId
        );
        if (index !== -1) {
          blogPost.comments[index] = {
            ...blogPost.comments[index].toObject(),
            ...req.body,
          };
          await blogPost.save();
          res.send(blogPost.comments[index]);
        } else {
          next(
            createError(
              404,
              `comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createError(
            404,
            `blogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const updatedblogPost = await blogPostsModel.findByIdAndUpdate(
        req.params.blogPostId,
        { $pull: { comments: { _id: req.params.commentId } } },
        { new: true, runValidators: true }
      );
      if (updatedblogPost) {
        res.send(updatedblogPost);
      } else {
        next(
          createError(
            404,
            `blogPost with id ${req.params.blogPostId} not found!`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
