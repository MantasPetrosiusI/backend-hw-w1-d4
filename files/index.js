import Express from "express";
import multer from "multer";
import { extname } from "path";
import { saveAuthorsAvatars, saveBlogPostCover } from "../lib/fs-tools.js";

const filesRouter = Express.Router();

filesRouter.post(
  "/authors/:authorId/uploadAvatar",
  multer().single("avatar"),
  async (req, res, next) => {
    try {
      console.log("FILE:", req.file);
      const originalFileExtension = extname(req.file.originalname);
      const fileName = req.params.authorId + originalFileExtension;
      await saveAuthorsAvatars(fileName, req.file.buffer);
      res.send({ message: "file uploaded" });
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.post(
  "/blogPosts/:blogPostId/uploadCover",
  multer().single("cover"),
  async (req, res, next) => {
    try {
      console.log("FILE:", req.file);
      const originalFileExtension = extname(req.file.originalname);
      const fileName = req.params.blogPostId + originalFileExtension;
      await saveBlogPostCover(fileName, req.file.buffer);
      res.send({ message: "file uploaded" });
    } catch (error) {
      next(error);
    }
  }
);

export default filesRouter;
