import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";

type AsyncController = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
) => Promise<any>;

const catchErrors = (controller: AsyncController): AsyncController => {
  return async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default catchErrors;