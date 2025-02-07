import { Router } from "express";
import validateRequest from "../middleware/validateRequest";
import { exportParamsSchema } from "../validations/itemIo.validation";
import upload from "../utils/multer";
import {
  exportToCsv,
  exportToExcel,
  exportToPDF,
  importItemsFromExcel,
} from "../handlers/itemsIo.handler";

const itemsIoRouter = Router();

// import basic items from an excel file
itemsIoRouter.post(
  "/projects/:projectId/items/import/excel",
  upload.single("file"),
  importItemsFromExcel
);

// Export basic items to an excel file
itemsIoRouter.get(
  "/projects/:projectId/items/export/excel",
  validateRequest(exportParamsSchema),
  exportToExcel
);

// TODO: Export basic items to an pdf file (not implemented yet)
itemsIoRouter.get("/projects/:projectId/items/export/pdf", exportToPDF);

// Export basic items to an csv file
itemsIoRouter.get(
  "/projects/:projectId/items/export/csv",
  validateRequest(exportParamsSchema),
  exportToCsv
);

export default itemsIoRouter;
