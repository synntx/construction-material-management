import { SubType } from "@prisma/client";
import { z } from "zod";
import { isValidCode } from "../utils/code";

export const excelItemSchema = z.object({
  SubType: z
    .string()
    .optional()
    .transform((val) => val?.toLowerCase().trim()),
  Code: z
    .string()
    .trim()
    .min(1, { message: "Code is required" })
    .superRefine((code, ctx) => {
      // access the parent
      // object through the input context
      const parentObj = (ctx as any).parent;
      const type = parentObj?.SubType as SubType | undefined;

      if (!type) {
        return;
      }

      if (!isValidCode(type, code)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid Code format for SubType ${type}. Code must be a valid parent code (M[number in range]) or child code (M[number in range]-[01-99]).`,
          path: ["Code"],
        });
      }
    }),
  "Item Name": z.string().trim().min(1, { message: "Item Name is required" }),
  Unit: z.string().trim().min(1, { message: "Unit is required" }),
  Rate: z.preprocess(Number, z.number().default(0)),
  "Avg. Lead Time": z.preprocess(Number, z.number().optional()),
});

export type ExcelItemSchemaType = z.infer<typeof excelItemSchema>;

export const itemsSchema = z.object({
  body: z.object({
    subType: z.nativeEnum(SubType, {
      message: "Please select a valid subtype",
    }),
    code: z.string().min(3),
    name: z.string().min(3),
    unit: z.string().min(1),
    rate: z.number().min(0),
    avgLeadTime: z.number().min(0).optional(),
  }),
  params: z.object({
    projectId: z.string().uuid({ message: "project id must be a valid uuid" }),
  }),
});

export type ItemSchemaType = z.infer<typeof itemsSchema>;

export const exportParamsSchema = z.object({
  params: z.object({
    projectId: z.string().uuid({ message: "project id must be a valid uuid" }),
  }),
});
