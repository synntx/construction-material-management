import { SubType } from "@prisma/client";
import { z } from "zod";

export const createItemSchema = z.object({
  body: z.object({
    projectId: z.string().uuid({ message: "Please provide a valid projectId" }),
    name: z
      .string()
      .min(1, { message: "Item is required" })
      .max(100, { message: "Item name must name exceed 100 characters" }),
    unit: z.string().min(1, { message: "unit name is required" }),
    rate: z
      .number({ invalid_type_error: "Rate must be a number" })
      .min(1, { message: "rate must be at least 1" }),
    avgLeadTime: z
      .number({ invalid_type_error: "Average lead time must be a number" })
      .positive({ message: "Average lead time must be a positive number" }),
    subType: z.nativeEnum(SubType, {
      message: "Please select a valid subtype",
    }),
    parentItemId: z
      .number({ invalid_type_error: "Parent item Id must be a number" })
      .optional(),
  }),
  query: z.object({}),
  params: z.object({
    projectId: z.string().uuid({ message: "Please provide a valid projectId" }),
  }),
});

//q
// subType?: string;
// minLeadTime?: string;
// maxLeadTime?: string;
// minRate?: string;
// maxRate?: string;
export const getItemsSchema = z.object({
  body: z.object({}),
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
    q: z.string().optional(),
    subType: z.nativeEnum(SubType).optional(),
    minLeadTime: z.string().optional(),
    maxLeadTime: z.string().optional(),
    minRate: z.string().optional(),
    maxRate: z.string().optional(),
  }),
});

export const searchItemSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    page: z
      .preprocess((val) => Number(val), z.number().int().positive())
      .optional(),
    limit: z
      .preprocess((val) => Number(val), z.number().int().positive())
      .optional(),
    sortBy: z.string().optional(),
    order: z.enum(["asc", "desc"]).optional(),
    q: z.string().optional(),
  }),
});

export const getItemSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    itemId: z.string({ invalid_type_error: "Please provide a valid itemId" }),
  }),
});

export const getChildItemsSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    projectId: z.string().uuid({ message: "Please provide a valid projectId" }),
    parentId: z.string({
      invalid_type_error: "Please provide a valid parenId",
    }),
  }),
});

export const updateItemSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: "Item name cannot be empty" })
      .max(100, { message: "Item name must not exceed 100 characters" })
      .optional(),
    unit: z.string().min(1, { message: "Unit cannot be empty" }).optional(),
    rate: z
      .number({ invalid_type_error: "Rate must be a number" })
      .min(1, { message: "Rate must be at least 1" })
      .optional(),
    avgLeadTime: z
      .number({ invalid_type_error: "Average lead time must be a number" })
      .positive({ message: "Average lead time must be a positive number" })
      .optional(),
    subType: z
      .nativeEnum(SubType, { message: "Please select a valid subtype" })
      .optional(),
    parentItemId: z
      .number({ invalid_type_error: "Parent item ID must be a number" })
      .optional(),
  }),
  query: z.object({}),
  params: z.object({
    projectId: z.string().uuid({ message: "Please provide a valid projectId" }),
    itemId: z.string({ invalid_type_error: "Please provide a valid itemId" }),
  }),
});

export const deleteItemSchema = z.object({
  body: z.object({}),
  query: z.object({}),
  params: z.object({
    projectId: z.string().uuid({ message: "Please provide a valid projectId" }),
    itemId: z.string({ invalid_type_error: "Please provide a valid itemId" }),
  }),
});

export type CreateItemInput = z.infer<typeof createItemSchema>["body"];
