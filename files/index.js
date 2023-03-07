import Express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

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

filesRouter.post(
  "/:authorId/uploadAvatar",
  uploaderAvatar,
  async (req, res, next) => {
    try {
      console.log("FILE:", req.file.path);
      res.send({ message: "file uploaded" });
    } catch (error) {
      next(error);
    }
  }
);

filesRouter.post(
  "/:blogPostId/uploadCover",
  uploaderCover,
  async (req, res, next) => {
    try {
      console.log("FILE:", req.file.path);
      res.send({ message: "file uploaded" });
    } catch (error) {
      next(error);
    }
  }
);

export default filesRouter;
