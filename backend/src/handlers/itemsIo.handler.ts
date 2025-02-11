import {
  NextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import * as XLSX from "xlsx";
import {
  excelItemSchema,
  ExcelItemSchemaType,
} from "../validations/itemIo.validation";
import prisma from "../prismaClient";
import catchErrors from "../utils/catchErrors";
import { createReadStream, unlinkSync } from "fs";
import { createObjectCsvWriter } from "csv-writer";
import logger from "../utils/logger";
import { Queue, QueueEvents } from "bullmq";
import { BasicItem } from "@prisma/client";
import path from "path";
import appAssert from "../utils/assert";
import { NOT_FOUND } from "../constants/http";

interface Project {
  id: string;
  name: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string;
  basicItems: BasicItem[];
}

const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || "http://localhost:3002";

const connection = {
  host: process.env.UPSTASH_HOST,
  port: process.env.UPSTASH_PORT ? Number(process.env.UPSTASH_PORT) : 6379,
  password: process.env.UPSTASH_TOKEN,
  tls: {},
};

const pdfQueue = new Queue<Project>("pdf-generation", { connection });
const queueEvents = new QueueEvents("pdf-generation", { connection });

//-------- EXCEL IMPORT ----------

export const importItemsFromExcel = catchErrors(
  async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    const projectId = req.params.projectId;

    if (!req.file) {
      logger.warn("No file uploaded for item import");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    logger.debug(
      `Excel file processed, sheet name: ${sheetName}, row count: ${sheet.length}`
    );

    // First pass: validate and collect all rows without parent-child checks.
    const validItems: Array<{
      projectId: string;
      subType: any;
      code: string;
      name: string;
      unit: string;
      rate: number;
      avgLeadTime: number;
      rowNumber: number;
    }> = [];
    const errors: any[] = [];
    for (const [index, row] of sheet.entries()) {
      const parsed = excelItemSchema.safeParse(row as any);
      if (!parsed.success) {
        errors.push({
          row,
          line: index + 1,
          error: parsed.error.errors,
        });
        logger.warn(
          `Validation error in Excel row ${index + 1}:`,
          parsed.error.errors
        );
        continue;
      }

      const validatedData: ExcelItemSchemaType = parsed.data;
      validItems.push({
        projectId,
        subType: validatedData.Type,
        code: validatedData.Code,
        name: validatedData["Item Name"],
        unit: validatedData.Unit,
        rate: validatedData.Rate,
        avgLeadTime: validatedData["Avg. Lead Time"] ?? 0,
        rowNumber: index + 1,
      });
    }

    // second pass: check that every child item’s parent exists somewhere in the sheet.
    // (A child item is one whose code contains a hyphen.)
    const itemsToInsert = validItems.filter((item) => {
      if (item.code.includes("-")) {
        const parentCode = item.code.split("-")[0];
        const parentFound = validItems.some((i) => i.code === parentCode);
        if (!parentFound) {
          errors.push({
            row: item.rowNumber,
            error: `Child item with code "${item.code}" has no matching parent "${parentCode}" in the Excel sheet.`,
          });
          logger.warn(
            `Child item with code "${item.code}" (row ${item.rowNumber}) has no matching parent "${parentCode}" in the Excel sheet.`
          );
          return false;
        }
      }
      return true;
    });

    if (itemsToInsert.length === 0) {
      logger.info("No valid items found in Excel file to import.");
      return res.status(400).json({
        message: "Import completed",
        successCount: 0,
        errors,
      });
    }

    // separate parent items and child items.
    // by convention, parent items do `NOT` have a hyphen in their code.
    const parentItems = itemsToInsert.filter(
      (item) => !item.code.includes("-")
    );
    const childItems = itemsToInsert.filter((item) => item.code.includes("-"));

    try {
      await prisma.$transaction(async (tx) => {
        // ----- BULK INSERT PARENT ITEMS -----
        if (parentItems.length > 0) {
          const parentData = parentItems.map((item) => ({
            projectId: item.projectId,
            subType: item.subType,
            code: item.code,
            name: item.name,
            unit: item.unit,
            rate: item.rate,
            avgLeadTime: item.avgLeadTime,
          }));
          await tx.basicItem.createMany({ data: parentData });
        }

        // ----- GET PARENT IDS FOR CHILD ITEMS -----
        // get parent codes referenced by child items. (Set for uniqueueness)
        const parentCodes = Array.from(
          new Set(childItems.map((item) => item.code.split("-")[0]))
        );

        // query the db for these parent's. This covers both newly inserted and pre-existing ones.
        const parentRecords = await tx.basicItem.findMany({
          where: {
            projectId: projectId,
            code: { in: parentCodes },
          },
          select: { id: true, code: true },
        });
        const parentMap = new Map<string, number>();
        for (const record of parentRecords) {
          parentMap.set(record.code, record.id);
        }

        // child items with their parentItemId.
        const childData = childItems.map((item) => {
          const parentCode = item.code.split("-")[0];
          const parentId = parentMap.get(parentCode);
          if (!parentId) {
            // this should not happen because of our checks we used previously,
            throw new Error(
              `Parent item with code "${parentCode}" not found in the database for child item "${item.code}".`
            );
          }
          return {
            projectId: item.projectId,
            subType: item.subType,
            code: item.code,
            name: item.name,
            unit: item.unit,
            rate: item.rate,
            avgLeadTime: item.avgLeadTime,
            parentItemId: parentId,
          };
        });

        // ----- BULK INSERT CHILD ITEMS -----
        if (childData.length > 0) {
          await tx.basicItem.createMany({
            data: childData,
            skipDuplicates: true,
          });
        }
      });

      logger.info(
        `Successfully imported ${itemsToInsert.length} items from Excel for projectId: ${projectId}`
      );
    } catch (error) {
      logger.error("Error during database transaction:", error);
      errors.push({ error: "Database transaction failed." });
      return res.status(500).json({
        message: "Import completed with errors",
        successCount: 0,
        errors,
      });
    }

    res.status(200).json({
      message: "Import completed",
      successCount: itemsToInsert.length,
      errors,
    });
  }
);

// -------- EXCEL EXPORT -----------

export const exportToExcel = catchErrors(async (req, res) => {
  logger.info("Handling exportToExcel request");
  const { projectId } = req.params;
  logger.debug(`Exporting items to Excel for projectId: ${projectId}`);

  const items = await prisma.basicItem.findMany({
    where: { projectId },
    orderBy: { code: "asc" },
  });
  logger.debug(
    `Retrieved ${items.length} items from database for Excel export`
  );

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(
    items.map((item) => ({
      Type: item.subType,
      Code: item.code,
      "Item Name": item.name,
      Unit: item.unit,
      Rate: item.rate?.toNumber(),
      "Avg. Lead Time": item.avgLeadTime,
    }))
  );

  XLSX.utils.book_append_sheet(workbook, worksheet, "Items");

  const excelBuffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=items-${projectId}.xlsx`
  );
  logger.info(
    `Excel export completed for projectId: ${projectId}, sending file`
  );
  res.send(excelBuffer);
});

// ------- CSV Generation ---------

export const exportToCsv = catchErrors(async (req, res) => {
  logger.info("Handling exportToCsv request");
  const { projectId } = req.params;
  logger.debug(`Exporting items to CSV for projectId: ${projectId}`);

  const items = await prisma.basicItem.findMany({
    where: { projectId },
    orderBy: { code: "asc" },
  });
  logger.debug(`Retrieved ${items.length} items from database for CSV export`);

  const csvWriter = createObjectCsvWriter({
    path: `items-${projectId}.csv`,
    header: [
      { id: "subType", title: "SubType" },
      { id: "code", title: "Code" },
      { id: "name", title: "Item Name" },
      { id: "unit", title: "Unit" },
      { id: "rate", title: "Rate" },
      { id: "avgLeadTime", title: "Avg. Lead Time" },
    ],
  });

  await csvWriter.writeRecords(items);
  logger.debug(`CSV file written to path: items-${projectId}.csv`);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=items-${projectId}.csv`
  );
  logger.info(`CSV export completed for projectId: ${projectId}, sending file`);

  const fileStream = createReadStream(`items-${projectId}.csv`);
  fileStream.pipe(res);

  fileStream.on("end", () => {
    unlinkSync(`items-${projectId}.csv`);
    logger.debug(`Temporary CSV file deleted: items-${projectId}.csv`);
  });
});

//**  --------- PDF GENERATION ----------

export const exportToPDF = catchErrors(
  async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    logger.info("Handling exportToPDF request");
    const { projectId } = req.params;
    logger.debug(`Exporting items to PDF for projectId: ${projectId}`);

    const payload = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
      include: {
        basicItems: {
          include: {
            childItems: {
              orderBy: { code: "asc" },
            },
          },
          orderBy: { code: "asc" },
        },
      },
    });

    appAssert(payload, NOT_FOUND, "Project not found");

    const job = await pdfQueue.add("pdf-generation", payload);

    /**
     * Approaches (for better ux, and real-time updates):
     ** 1. WebSocket:
     *    - Client subscribes: ws.subscribe(`pdf-${jobId}`)
     *    - Worker emits completion: ws.emit(`pdf-${jobId}`, {url, status})
     ** 2. Server-Sent Events (SSE):
     *    - One-way server -> client updates
     ** 3. Cloud Storage:
     *    - Worker uploads to S3/Azure Blob
     *    - Store job status and after completion save uploaded file url to db
     */

    const result = await job.waitUntilFinished(queueEvents, 60000);

    if (result && result.filePath) {
      const filename = path.basename(result.filePath);
      res.json({
        jobId: job.id,
        filename,
        downloadUrl: `${PDF_SERVICE_URL}/api/download/${filename}`,
      });
    } else {
      res.status(500).json({ message: "PDF generation failed" });
    }
  }
);
