import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: "Project name is required" })
      .max(100, { message: "Project name must be less than 100 characters" }),
  }),
});

export const getProjectSchema = z.object({
  params: z.object({
    projectId: z.string().uuid({ message: "project id must be a valid uuid" }),
  }),
  query: z.object({
    page: z
      .preprocess((val) => Number(val), z.number().int().positive())
      .optional(),
    limit: z
      .preprocess((val) => Number(val), z.number().int().positive())
      .optional(),
    sortBy: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const searchProjectSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z
      .preprocess((val) => Number(val), z.number().int().positive())
      .optional(),
    limit: z
      .preprocess((val) => Number(val), z.number().int().positive())
      .optional(),
    q: z.string().optional(),
  }),
});

export const UpdateProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: "Project name is required" })
      .max(100, { message: "Project name must be less than 100 characters" }),
  }),
  params: z.object({
    projectId: z.string().uuid({ message: "project id must be a valid uuid" }),
  }),
});

export const DeleteProjectSchema = z.object({
  body: z.object({}),
  params: z.object({
    projectId: z.string().uuid({ message: "project id must be a valid uuid" }),
  }),
});
