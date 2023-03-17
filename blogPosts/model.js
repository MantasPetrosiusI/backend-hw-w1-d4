import mongoose, { model } from "mongoose";

const { Schema } = mongoose;

const blogPostSchema2 = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: true },
    readTime: {
      value: { type: Number, required: true },
      unit: {
        type: String,
        required: true,
        validate: {
          validator: function (unit) {
            return ["seconds", "minutes", "hours"].includes(unit);
          },
          message: "Unit must be one of 'seconds', 'minutes', or 'hours'",
        },
      },
    },
    author: { type: Schema.Types.ObjectId, ref: "Author" },

    content: { type: String },
    comments: [
      {
        content: String,
        author: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("blogposts", blogPostSchema2);
