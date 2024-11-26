import { validationResult } from "express-validator";

/**
 * Middleware function to handle input validation errors.
 *
 * This function checks for validation errors in the request object.
 * If there are errors, it responds with a 400 status code and a JSON object containing the errors.
 * If there are no errors, it calls the next middleware function.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 */
export const handleInputErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400);
    res.json({ errors: errors.array() });
  } else {
    next();
  }
};
