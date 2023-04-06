import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import endpoints from "express-list-endpoints";
import authorsRouter from "./authors/index.js";
import blogPostsRouter from "./blogPosts/index.js";
import filesRouter from "./files/index.js";
import {
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
  notFoundErrorHandler,
  genericErroHandler,
} from "./errorHandlers.js";
import createError from "http-errors";
import passport from "passport";
import googleStrategy from "./lib/googleOAuth.js";

const server = express();
const port = process.env.PORT || 3024;

passport.use("google", googleStrategy);

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(
  cors({
    origin: (currentOrigin, corsNext) => {
      if (!currentOrigin || whitelist.indexOf(currentOrigin) !== -1) {
        corsNext(null, true);
      } else {
        corsNext(
          createError(400, `Origin ${currentOrigin} is not in the whitelist!`)
        );
      }
    },
  })
);

server.use(express.json());
server.use(passport.initialize());

server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
server.use("/", filesRouter);

server.use(unauthorizedErrorHandler);
server.use(forbiddenErrorHandler);
server.use(notFoundErrorHandler);
server.use(genericErroHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected!");
  server.listen(port, () => {
    console.table(endpoints(server));
    console.log(port);
  });
});
