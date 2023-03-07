import Express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

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
      console.log("FILE:", req.file);
      res.send({ message: "file uploaded" });
    } catch (error) {
      next(error);
    }
  }
);

export default filesRouter;
