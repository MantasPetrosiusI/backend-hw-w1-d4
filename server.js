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

const server = express();

server.use(cors());

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

server.listen(3025, () => {
  console.table(endpoints(server));
});
