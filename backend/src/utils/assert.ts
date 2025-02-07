import assert from "node:assert";
import { HttpStatusCode } from "../constants/http";
import AppError from "./appError";

type AppAssert = (
  condition: any,
  HttpStatusCode: HttpStatusCode,
  message: string
) => asserts condition;

const appAssert: AppAssert = (condition: any, HttpStatusCode, message) =>
  assert(condition, new AppError(HttpStatusCode, message));

export default appAssert;
