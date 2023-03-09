import express from "express";
import uniqid from "uniqid";
import { blogPostSchema } from "./validation.js";
import { getBlogPosts, writeBlogPosts, getAuthors } from "../lib/fs-tools.js";
import {
  sendsCreatedPostEmail,
  sendsMailWithAttachment,
} from "../lib/email-tools.js";
import { asyncBlogPostsPDFGenerator } from "../lib/pdf-tools.js";
const blogPostsRouter = express.Router();

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
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
    const blogPosts = await getBlogPosts();
    const blogPost = blogPosts.find(
      (singleBlogPost) => singleBlogPost.id === req.params.blogPostId
    );
    if (!blogPost) {
      res.status(404).send({ message: `It's 404 you know what it means :)` });
    }
    res.send(blogPost);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post("/", async (req, res, next) => {
  try {
    const { error } = blogPostSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const blogPost = {
      id: uniqid(),
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const blogPosts = await getBlogPosts();
    const authors = await getAuthors();
    const author = authors.find((a) => a.email === req.body.author.email);

    blogPosts.push(blogPost);
    await writeBlogPosts(blogPosts);
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
    const index = blogPosts.findIndex(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    if (!index == -1) {
      res.status(404).send({ message: `It's 404 you know what it means X)` });
    }
    const preEdit = blogPosts[index];
    const afterEdit = {
      ...preEdit,
      ...req.body,
      updatedAt: new Date(),
    };
    blogPosts[index] = afterEdit;
    await writeBlogPosts(blogPosts);
    res.status(202).send(afterEdit);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const blogPost = blogPosts.find(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    if (!blogPost) {
      res.status(404).send({ message: `It's 404 you know what it means :/` });
    }

    const remainingBlogPosts = blogPosts.filter(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    await writeBlogPosts(remainingBlogPosts);
    res.status(204).send(remainingBlogPosts);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

blogPostsRouter.get("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const index = blogPosts.findIndex(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    res.send(blogPosts[index]);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.post("/:blogPostId/comments", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const index = blogPosts.findIndex(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    const newComment = {
      _id: uniqid(),
      ...req.body,
      createdAt: new Date(),
    };
    console.log(blogPosts[index]);
    blogPosts[index].comments.push(newComment);
    await writeBlogPosts(blogPosts);
    res.status(201).send(blogPosts[index].comments);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPosts = await getBlogPosts();
      let commentIndex = 0;
      const blogIndex = blogPosts.findIndex(
        (blogPost) => blogPost.id === req.params.blogPostId
      );
      if (!blogIndex == -1) {
        res.status(404).send({ message: `It's 404 you know what it means X)` });
      } else {
        commentIndex = blogPosts[blogIndex].comments.findIndex(
          (comment) => comment._id === req.params.commentId
        );
      }
      const preEdit = blogPosts[blogIndex].comments[commentIndex];
      const afterEdit = {
        ...preEdit,
        ...req.body,
        updatedAt: new Date(),
      };
      blogPosts[blogIndex].comments[commentIndex] = afterEdit;
      await writeBlogPosts(blogPosts);
      res.status(202).send(afterEdit);
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.delete(
  "/:blogPostId/comments/:commentId",
  async (req, res, next) => {
    try {
      const blogPosts = await getBlogPosts();
      const index = blogPosts.findIndex(
        (blogPost) => blogPost._id === req.params.postId
      );
      const oldBlogPost = blogPosts[index];
      const newComments = oldBlogPost.comments.filter(
        (comment) => comment._id !== req.params.commentId
      );
      const newPost = { ...oldBlogPost, comments: newComments };
      blogPosts[index] = newPost;
      await writeBlogPosts(blogPosts);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default blogPostsRouter;
