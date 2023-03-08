import Express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import {
  getAuthors,
  getBlogPosts,
  getBlogpostsJSONReadableStream,
  writeAuthors,
  writeBlogPosts,
} from "../lib/fs-tools.js";
import createError from "http-errors";
import { pipeline } from "stream";

const filesRouter = Express.Router();

const uploaderAvatar = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "backend-w2-d1/img/avatars" },
  }),
}).single("avatar");

const uploaderCover = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "backend-w2-d1/img/covers" },
  }),
}).single("cover");

filesRouter.post(
  "/authors/:authorId/uploadAvatar/single",
  uploaderAvatar,
  async (req, res, next) => {
    try {
      console.log("FILE:", req.file);
      const authors = await getAuthors();
      console.log(authors);
      const index = authors.findIndex(
        (author) => author._id === req.params.authorId
      );
      console.log(index);
      if (index !== -1) {
        console.log(authors[(index.avatar, `\n`, req.file.path)]);
        authors[index].avatar = req.file.path;
        await writeAuthors(authors);
        res.status(201).send({ message: "Uploaded!" });
      }
    } catch (error) {
      console.log("fire");
      next(error);
    }
  }
);

filesRouter.post(
  "/blogPosts/:blogPostId/uploadCover/single",
  uploaderCover,
  async (req, res, next) => {
    try {
      console.log("FILE:", req.file);
      const blogPosts = await getBlogPosts();
      const index = blogPosts.findIndex(
        (blogPost) => blogPost.id === req.params.blogPostId
      );
      if (index !== -1) {
        blogPosts[index].cover = req.file.path;
        await writeBlogPosts(blogPosts);
        res.status(201).send({ message: "Uploaded!" });
      }
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.post("/blogPosts/:blogPostId/pdf", async (req, res, next) => {
  const blogPosts = await getBlogPosts();
  const blogPost = blogPosts.find((b) => b.id === req.params.blogPostId);
  if (blogPost) {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.blogPostId}.pdf`
    );
    const source = getBlogpostsJSONReadableStream(blogPost);
    const destination = res;
    pipeline(source, destination, (err) => {
      if (err) {
        next(err);
      }
    });
  } else {
    next(createError(404, `It's 404 regarding pdf you know what that means!`));
  }
});

export default filesRouter;
