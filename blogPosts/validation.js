import Joi from "joi";

export const blogPostSchema = Joi.object({
  _id: Joi.string(),
  category: Joi.string().required(),
  title: Joi.string().required(),
  cover: Joi.string().required(),
  readTime: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string().required(),
  }).required(),
  author: Joi.object({
    name: Joi.string().required(),
    avatar: Joi.string().required(),
  }).required(),
  content: Joi.string(),
  comments: Joi.array(),
});

export const commentsSchema = Joi.object({
  comment: Joi.object({
    id: Joi.string(),
    text: Joi.string().required(),
  }).required(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
});
