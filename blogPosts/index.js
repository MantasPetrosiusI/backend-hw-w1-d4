import express from "express";
import mongoose from "mongoose";
import createError from "http-errors";
import blogPostsModel from "./model.js";
import { getBlogPosts, writeBlogPosts, getAuthors } from "../lib/fs-tools.js";
import {
  sendsCreatedPostEmail,
  sendsMailWithAttachment,
} from "../lib/email-tools.js";
import { asyncBlogPostsPDFGenerator } from "../lib/pdf-tools.js";
const blogPostsRouter = express.Router();

blogPostsRouter.get("/", async (req, res, next) => {
  const perPage = req.query.perPage;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * perPage;

  try {
    const blogPosts = await blogPostsModel
      .find()
      .sort(req.query.sort)
      .skip(skip)
      .limit(req.query.limit);
    // .skip(skip)
    // .limit(perPage);

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
    const blogPosts = await blogPostsModel.findById(req.params.blogPostId);
    res.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post("/", async (req, res, next) => {
  try {
    const blogPost = new blogPostsModel(req.body);
    const blogPosts = await getBlogPosts();
    const authors = await getAuthors();
    const author = authors.find((a) => a.email === req.body.author.email);

    blogPosts.push(blogPost);
    await writeBlogPosts(blogPosts);
    const { _id } = await blogPost.save();
    await sendsCreatedPostEmail(author.email);

    res.status(201).send(blogPost);

    await asyncBlogPostsPDFGenerator(blogPost);
    await sendsMailWithAttachment(blogPost);
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
      if (!blogPost) {
        return next(
          createError(
            404,
            `Blog post with id ${req.params.blogPostId} not found!`
          )
        );
      }

      const comment = blogPost.comments.find(
        (c) => c._id.toString() === req.params.commentId
      );
      if (!comment) {
        return next(
          createError(404, `Comment with id ${req.params.commentId} not found!`)
        );
      }

      res.send(comment);
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPost = await blogPostsModel.findById(req.params.blogPostId);
    if (!blogPost) {
      return next(
        createError(
          404,
          `Blog post with id ${req.params.blogPostId} not found!`
        )
      );
    }

    const newComment = {
      comment: req.body.text,
      author: req.body.author,
      createdAt: new Date(),
      _id: new mongoose.Types.ObjectId(),
    };
    blogPost.comments.push(newComment);
    const { _id } = await blogPost.save();

    res.status(201).send({ _id });
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
            ...blogPost.comments[index],
            ...req.body,
            _id: blogPost.comments[index]._id, // ensure _id is not overwritten
            createdAt: blogPost.comments[index].createdAt, // ensure createdAt is not overwritten
          };
          await blogPost.save();
          res.send(blogPost);
        } else {
          next(
            createError(
              404,
              `Comment with id ${req.params.commentId} not found!`
            )
          );
        }
      } else {
        next(
          createError(
            404,
            `Blog post with id ${req.params.blogPostId} not found!`
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
      const blogPost = await blogPostsModel.findById(req.params.blogPostId);
      if (!blogPost) {
        return next(
          createError(
            404,
            `Blog post with id ${req.params.blogPostId} not found!`
          )
        );
      }
      const commentIndex = blogPost.comments.findIndex(
        (c) => c._id == req.params.commentId
      );
      if (commentIndex === -1) {
        return next(
          createError(
            404,
            `Comment with id ${req.paramscommentId} not found in blog post with id ${req.paramsblogPostId}!`
          )
        );
      }
      blogPost.comments.splice(commentIndex, 1);
      await blogPost.save();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
