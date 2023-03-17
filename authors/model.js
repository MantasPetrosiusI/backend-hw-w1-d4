import mongoose from "mongoose";

const { Schema, model } = mongoose;

const authorsSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    dob: { type: String, required: true },
    avatar: { type: String },
  },
  {
    timestamps: true,
  },
  {
    Blogs: [{ type: Schema.Types.ObjectId, ref: "blogposts" }],
  }
);
export default model("Author", authorsSchema);
