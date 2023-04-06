import jwt from "jsonwebtoken";

export const createAccessToken = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      { expiresIn: "1 week" },
      (error, token) => {
        if (error) reject(error);
        else resolve(token);
      }
    )
  );

export const verifyAccessToken = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.SECRET_KEY, (error, payload) => {
      if (error) reject(error);
      else resolve(payload);
    })
  );
