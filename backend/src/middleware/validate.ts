import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { idSchema } from "../schemas/common.js";
import { HttpError } from "../utils/HttpError.js";

export const validateBody = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  req.body = schema.parse(req.body ?? {});
  next();
};

/** В Express 5 req.query только для чтения, поэтому разобранный query кладём в res.locals.query */
export const validateQuery = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  res.locals.query = schema.parse(req.query);
  next();
};

export function validateIdParam(_req: Request, _res: Response, next: NextFunction, id: string) {
  if (!idSchema.safeParse(id).success) throw new HttpError(404, "Запись не найдена");
  next();
}
