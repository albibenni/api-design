import { describe, it, expect, vi } from "vitest";
import { validationResult } from "express-validator";
import { handleInputErrors } from "../modules/middleware.js";

vi.mock("express-validator", () => ({
  validationResult: vi.fn(),
}));

describe("handleInputErrors", () => {
  it("should call next if there are no validation errors", () => {
    const req = {};
    const res = {
      status: vi.fn(),
      json: vi.fn(),
    };
    const next = vi.fn();

    (validationResult as any).mockReturnValue({ isEmpty: () => true });

    handleInputErrors(req, res, next);

    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should respond with 400 and errors if there are validation errors", () => {
    const req = {};
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    const errorsArray = [{ msg: "Error message" }];

    (validationResult as any).mockReturnValue({
      isEmpty: () => false,
      array: () => errorsArray,
    });

    handleInputErrors(req, res, next);

    expect(validationResult).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: errorsArray });
    expect(next).not.toHaveBeenCalled();
  });
});
