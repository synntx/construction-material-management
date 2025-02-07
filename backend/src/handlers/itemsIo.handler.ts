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
import { NO_CONTENT } from "../constants/http";

export const importItemsFromExcel = catchErrors(
  async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    logger.info("Handling importItemsFromExcel request");
    const projectId = req.params.projectId;
    logger.debug(`Importing items for projectId: ${projectId}`);

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

    const validItems: {
      projectId: string;
      subType: any;
      code: string;
      name: string;
      unit: string;
      rate: number;
      avgLeadTime: number;
    }[] = [];
    const errors = [];

    for (const row of sheet) {
      const parsed = excelItemSchema.safeParse(row as any);
      if (!parsed.success) {
        errors.push({ row, error: parsed.error.errors });
        logger.warn("Validation error in Excel row:", {
          row,
          errors: parsed.error.errors,
        });
      } else {
        const validatedData: ExcelItemSchemaType = parsed.data;
        validItems.push({
          projectId,
          subType: validatedData.SubType,
          code: validatedData.Code,
          name: validatedData["Item Name"],
          unit: validatedData.Unit,
          rate: validatedData.Rate,
          avgLeadTime: validatedData["Avg. Lead Time"] ?? 0,
        });
      }
    }

    if (validItems.length > 0) {
      logger.debug(
        `Valid items found, count: ${validItems.length}, proceeding with database transaction`
      );
      await prisma.$transaction(async (tx) => {
        await tx.basicItem.createMany({
          data: validItems,
          skipDuplicates: true,
        });
      });
      logger.info(
        `Successfully imported ${validItems.length} items from Excel for projectId: ${projectId}`
      );
    } else {
      logger.info("No valid items found in Excel file to import.");
    }

    res.status(200).json({
      message: "Import completed",
      successCount: validItems.length,
      errors,
    });
  }
);

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
      SubType: item.subType,
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

export const exportToPDF = catchErrors(async (req, res) => {
  logger.info("Handling exportToPDF request");
  const { projectId } = req.params;
  logger.debug(`Exporting items to PDF for projectId: ${projectId}`);
  logger.warn("Export to PDF feature is not yet implemented");

  res
    .status(501)
    .json({ message: "Export to PDF feature is not implemented yet!" });
});
