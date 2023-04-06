import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const authorsSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    dob: { type: String, required: true },
    avatar: { type: String },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "User"],
      default: "User",
    },
    googleId: {
      type: String,
    },
  },

  {
    timestamps: true,
  },
  {
    Blogs: [{ type: Schema.Types.ObjectId, ref: "blogposts" }],
  }
);

authorsSchema.pre("save", async function () {
  const newAuthor = this;
  if (newAuthor.isModified("password")) {
    const plainTextPW = newAuthor.password;
    const hash = await bcrypt.hash(plainTextPW, 11);
    newAuthor.password = hash;
  }
});

authorsSchema.methods.toJSON = function () {
  const currentAuthor = this.toObject();
  delete currentAuthor.password;
  delete currentAuthor.createdAt;
  delete currentAuthor.updatedAt;
  delete currentAuthor.__v;
  return currentAuthor;
};

authorsSchema.static("checkCredentials", async function (email, plainTextPW) {
  const author = await this.findOne({ email });
  if (author) {
    const isMatching = await bcrypt.compare(plainTextPW, author.password);
    if (isMatching) {
      return author;
    } else {
      return null;
    }
  } else {
    return null;
  }
});
export default model("author", authorsSchema);
