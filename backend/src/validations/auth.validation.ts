import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must be at most 50 characters long")
      .trim(),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password must be at most 100 characters long"),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().nonempty({ message: "Password is required" }),
  }),
});
