import { Router } from "express";
import { signupSchema, signinSchema } from "../validations/auth.validation";
import { signupHandler, signinHandler } from "../handlers/auth.handler";
import validateRequest from "../middleware/validateRequest";

const authRouter = Router();

// Signup route
authRouter.post("/signup", validateRequest(signupSchema), signupHandler);

// Signin route
authRouter.post("/signin", validateRequest(signinSchema), signinHandler);

export default authRouter;
