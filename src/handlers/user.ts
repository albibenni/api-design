import { User } from "@prisma/client";
import prisma from "../db.js";
import { comparePasswords, createJWT, hashPassword } from "../modules/auth.js";
import { NextFunction, Request, Response } from "express";

/**
 * Creates a new user in the database.
 *
 * @param req - The request object containing the user data.
 * @param res - The response object to send the response.
 * @param next - The next middleware function in the stack.
 *
 * @returns A JSON response containing a JWT token for the newly created user.
 *
 * @throws Will throw an error if user creation fails.
 */
export const createNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user: User = await prisma.user.create({
      data: {
        username: req.body.username,
        password: await hashPassword(req.body.password),
      },
    });
    await prisma.$disconnect(); // check if this is necessary

    const token = createJWT(user);
    res.json({ token });
  } catch (error: any) {
    console.error(error.message);
    error.type = "input";
    next(error);
  }
};

export const signin = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      username: req.body.username,
    },
  });

  if (!user) {
    res.status(401);
    res.json({ message: "nope" });
    return;
  }
  const isValid = await comparePasswords(req.body.password, user.password);

  if (!isValid) {
    res.status(401);
    res.json({ message: "nope" });
    return;
  }

  const token = createJWT(user);
  res.json({ token });
};
