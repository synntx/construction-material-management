import { Router } from "express";
import validateRequest from "../middleware/validateRequest";
import {
  createItemSchema,
  deleteItemSchema,
  getChildItemsSchema,
  getItemSchema,
  getItemsSchema,
  searchItemSchema,
  updateItemSchema,
} from "../validations/item.validation";
import {
  createItemHandler,
  deleteItemHandler,
  getChildItemsHandler,
  getItemHandler,
  getItemsHandler,
  searchItemsHandler,
  updateItemHandler,
} from "../handlers/items.handler";

const itemRouter = Router();

// Create a new basic item
itemRouter.post(
  "/projects/:projectId/items",
  validateRequest(createItemSchema),
  createItemHandler
);

// List basic items for a projects
itemRouter.get(
  "/projects/:projectId/items",
  validateRequest(getItemsSchema),
  getItemsHandler
);

// Get child items
itemRouter.get(
  "/projects/:projectId/citems/:parentId",
  validateRequest(getChildItemsSchema),
  getChildItemsHandler
);

// Get details of a item
itemRouter.get(
  "/projects/:projectId/items/:itemId",
  validateRequest(getItemSchema),
  getItemHandler
);

itemRouter.get(
  "/items/search",
  validateRequest(searchItemSchema),
  searchItemsHandler
);

// Update a basic item
itemRouter.put(
  "/projects/:projectId/items/:itemId",
  validateRequest(updateItemSchema),
  updateItemHandler
);

// delete a basic item
itemRouter.delete(
  "/projects/:projectId/items/:itemId",
  validateRequest(deleteItemSchema),
  deleteItemHandler
);

export default itemRouter;
