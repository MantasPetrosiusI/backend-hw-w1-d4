import mongoose, { model } from "mongoose";

const { Schema } = mongoose;

const commentsSchema = new Schema(
  {
    comment: {
      text: { type: String, required: true },
      author: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export default model("comments", commentsSchema);
