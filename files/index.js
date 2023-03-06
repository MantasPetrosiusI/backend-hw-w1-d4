import Express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { extname } from "path";
import { saveAuthorsAvatars, saveBlogPostCover } from "../lib/fs-tools.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const filesRouter = Express.Router();
const uploaderAvatar = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "/img/avatars" },
  }),
}).single("avatar");
const uploaderCover = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: { folder: "/img/avatars" },
  }),
}).single("cover");
filesRouter.post(uploaderAvatar, async (req, res, next) => {
  try {
    console.log("FILE:", req.file);
    const originalFileExtension = extname(req.file.originalname);
    const fileName = req.params.authorId + originalFileExtension;
    await saveAuthorsAvatars(fileName, req.file.buffer);
    res.send({ message: "file uploaded" });
  } catch (error) {
    next(error);
  }
});

filesRouter.post(uploaderCover, async (req, res, next) => {
  try {
    console.log("FILE:", req.file);
    const originalFileExtension = extname(req.file.originalname);
    const fileName = req.params.blogPostId + originalFileExtension;
    await saveBlogPostCover(fileName, req.file.buffer);
    res.send({ message: "file uploaded" });
  } catch (error) {
    next(error);
  }
});

export default filesRouter;
