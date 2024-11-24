import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";

/**
 * Compares a plaintext password with a hashed password.
 *
 * @param password - The plaintext password to compare.
 * @param hash - The hashed password to compare against.
 * @returns A promise that resolves to a boolean indicating whether the passwords match.
 */
export const comparePasswords = (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Hashes a given password using bcrypt with a salt rounds value of 5.
 *
 * @param password - The plain text password to be hashed.
 * @returns A promise that resolves to the hashed password string.
 */
export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 5);
};

/**
 * Generates a JSON Web Token (JWT) for the given user.
 *
 * @param {User} user - The user object containing user details.
 * @returns {string} - The generated JWT token.
 * @throws {Error} - Throws an error if the JWT secret is not found in the environment variables.
 */
export const createJWT = (user: User): string => {
  const jwt_secret = process.env.JWT_SECRET;
  if (!jwt_secret) {
    throw new Error("No JWT secret found");
  }
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    jwt_secret,
  );
  return token;
};

/**
 * Middleware to protect routes by verifying the JWT token.
 *
 * This middleware checks for the presence of a JWT token in the `Authorization` header of the request.
 * If the token is valid, it attaches the decoded user information to the `req` object and calls the `next` middleware.
 * If the token is missing or invalid, it responds with a 401 status and an appropriate error message.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 *
 * @throws Will throw an error if the JWT secret is not found in the environment variables.
 */
export const protect = (req: any, res: any, next: any): void => {
  const jwt_secret = process.env.JWT_SECRET;
  if (!jwt_secret) {
    throw new Error("No JWT secret found");
  }
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401);
    res.json({ message: "not authorized" });
    return;
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    res.status(401);
    res.json({ message: "not valid token" });
    return;
  }

  try {
    const user = jwt.verify(token, jwt_secret);
    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    res.status(401);
    res.json({ message: "not valid token" });
    return;
  }
};
