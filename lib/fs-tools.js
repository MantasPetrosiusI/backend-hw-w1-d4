import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile, createReadStream } = fs;

const dataFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../JSONdata"
);
const authorsJSONPath = join(dataFolderPath, "authors.json");
const blogPostsJSONPath = join(dataFolderPath, "blogPosts.json");
const rootFolder = process.cwd();

export const getAuthors = () => readJSON(authorsJSONPath);
export const writeAuthors = (authorsArray) =>
  writeJSON(authorsJSONPath, authorsArray);

export const getBlogPosts = () => readJSON(blogPostsJSONPath);
export const writeBlogPosts = (blogPostsArray) =>
  writeJSON(blogPostsJSONPath, blogPostsArray);

export const saveAuthorsAvatars = (fileName, fileConentsAsBuffer) =>
  writeFile(
    join(rootFolder + "/public/img/authors", fileName),
    fileConentsAsBuffer
  );
export const saveBlogPostCover = (fileName, fileConentsAsBuffer) =>
  writeFile(
    join(rootFolder + "/public/img/blogPosts", fileName),
    fileConentsAsBuffer
  );

export const getAuthorsJSONReadableStream = () =>
  createReadStream(authorsJSONPath);
export const getBlogpostsJSONReadableStream = () =>
  createReadStream(blogPostsJSONPath);
