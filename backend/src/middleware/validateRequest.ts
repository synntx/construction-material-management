import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import logger from "../utils/logger";

const validateRequest = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Validating request");
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      logger.debug("Request validation successful");
      next();
    } catch (error) {
      logger.warn("Request validation failed", error);
      next(error);
    }
  };
};

export default validateRequest;
