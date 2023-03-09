import Express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import {
  getAuthors,
  getAuthorsJSONReadableStream,
  getBlogPostJSONReadableStream,
  getBlogPosts,
  writeAuthors,
  writeBlogPosts,
} from "../lib/fs-tools.js";
import {
  getBlogPostReadableStream,
  asyncBlogPostsPDFGenerator,
} from "../lib/pdf-tools.js";
import createError from "http-errors";
import { pipeline } from "stream";
import { Transform } from "@json2csv/node";

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

filesRouter.get("/:blogPostId/pdf", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    const blogPost = blogPosts.find((b) => b.id === req.params.blogPostId);
    if (blogPost) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${req.params.blogPostId}.pdf`
      );
      const source = await getBlogPostReadableStream(blogPost);
      const destination = res;
      pipeline(source, destination, (err) => {
        if (err) {
          console.log(err);
        }
      });
    } else {
      next(
        createError(404, `It's 404 regarding pdf you know what that means!`)
      );
    }
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/authorsCSV", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", `attachment; filename=authors.csv`);
    const source = getAuthorsJSONReadableStream();
    const transform = new Transform({
      fields: [
        "_id",
        "name",
        "surname",
        "email",
        "dob",
        "avatar",
        "createdAt",
        "updatedAt",
      ],
    });
    const destination = res;
    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/blogPostsCSV", async (req, res, next) => {
  try {
    res.setHeader("Content-Disposition", `attachment; filename=blogPosts.csv`);
    const source = getBlogPostJSONReadableStream();
    const transform = new Transform({
      fields: [
        "id",
        "category",
        "title",
        "cover",
        "author",
        "content",
        "comments",
        "createdAt",
        "updatedAt",
      ],
    });
    const destination = res;
    pipeline(source, transform, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/:blogPostId/asyncBlogPostsPDF", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    console.log(blogPosts);
    const blogPost = blogPosts.find((b) => b.id === req.params.blogPostId);
    await asyncBlogPostsPDFGenerator(blogPost);
    res.send({ message: `ok` });
  } catch (error) {
    next(error);
  }
});
export default filesRouter;
