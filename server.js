import express from "express";
import cors from "cors";
import { join } from "path";
import endpoints from "express-list-endpoints";
import authorsRouter from "./authors/index.js";
import blogPostsRouter from "./blogPosts/index.js";
import filesRouter from "./files/index.js";
import {
  badRequestHandler,
  unauthorizedHandler,
  notfoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import createError from "http-errors";
const server = express();
const port = process.env.PORT || 3024;

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

const publicFolderPath = join(process.cwd(), "./public");

server.use(express.static(publicFolderPath));

server.use(express.json());

server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);
server.use("/", filesRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(notfoundHandler);
server.use(genericErrorHandler);

server.listen(port, () => {
  console.table(endpoints(server));
  console.log(port);
});
