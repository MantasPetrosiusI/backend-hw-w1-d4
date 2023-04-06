import GoogleStrategy from "passport-google-oauth20";
import authorsModel from "../authors/index.js";
import { createAccessToken } from "./access.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.API_URL}/authors/google/callback`,
  },
  async (_, __, profile, passportNext) => {
    try {
      const { email, given_name, family_name, sub } = profile._json;
      const author = await authorsModel.findOne({ email });
      if (author) {
        const accessToken = await createAccessToken({
          _id: author._id,
          role: author.role,
        });

        passportNext(null, { accessToken });
      } else {
        const newAuthor = new authorsModel({
          name: given_name,
          surname: family_name,
          email,
          googleId: sub,
        });

        const createdAuthor = await newAuthor.save();

        const accessToken = await createAccessToken({
          _id: createdAuthor._id,
          role: createdAuthor.role,
        });

        passportNext(null, { accessToken });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);

export default googleStrategy;
