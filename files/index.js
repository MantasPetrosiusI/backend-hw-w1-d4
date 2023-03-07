import Express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import {
  getAuthors,
  getBlogPosts,
  writeAuthors,
  writeBlogPosts,
} from "../lib/fs-tools.js";

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
    params: { folder: "/img/covers" },
  }),
}).single("cover");

filesRouter.post(
  "/:authorId/uploadAvatar/single",
  uploaderAvatar,
  async (req, res, next) => {
    try {
      console.log("FILE:", req.file);
      const authors = await getAuthors();
      const index = authors.findIndex(
        (author) => author.id === req.params.authorId
      );
      if (index !== -1) {
        console.log(authors[(index.avatar, `\n`, req.file.path)]);
        authors[index].avatar = req.file.path;
        await writeAuthors(authors);
        res.status(201).send({ message: "Uploaded!" });
      }
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.post(
  "/:blogPostId/uploadCover/single",
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

export default filesRouter;
