import { Request, Response, NextFunction } from "express";
import catchErrors from "../utils/catchErrors";
import { signup, signin } from "../services/auth.service";
import { OK } from "../constants/http";
import logger from "../utils/logger";

export const signupHandler = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Signup request received");
    const { name, email, password } = req.body;
    logger.debug(`Signup attempt for email: ${email}, name: ${name}`);

    const { user, token } = await signup({ name, email, password });
    logger.info(
      `User signup successful for email: ${user.email}, userId: ${user.id}`
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(OK).json(user);
  }
);

export const signinHandler = catchErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    logger.info("Signin request received");
    const { email, password } = req.body;
    logger.debug(`Signin attempt for email: ${email}`);

    const { token } = await signin({ email, password });

    logger.info(`Signin successful for email: ${email}`);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(OK).json({ token });
  }
);
