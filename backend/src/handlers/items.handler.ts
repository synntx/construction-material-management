import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { Response as ExpressResponse, NextFunction } from "express";
import catchErrors from "../utils/catchErrors";
import {
  createItem,
  deleteItem,
  getChildItems,
  getItem,
  getItems,
  GetItemsQueryParams,
  searchItems,
  SearchItemsQueryParams,
  updateItem,
  UpdateItemInput,
} from "../services/items.service";
import { CreateItemInput } from "../validations/item.validation";
import { CREATED, NO_CONTENT, NOT_FOUND, OK } from "../constants/http";
import appAssert from "../utils/assert";
import logger from "../utils/logger"; 

export const createItemHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling createItem request");
    const data = req.body as CreateItemInput;
    logger.debug("Create item data:", data);

    const item = await createItem(data);
    logger.info(`Item created successfully with ID: ${item.id}`);

    return res.status(CREATED).json(item);
  }
);

export const getItemsHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling getItems request");
    const projectId = req.params.projectId as string;
    const { page, limit, sortBy, order } = req.query as GetItemsQueryParams;
    logger.debug(
      `Get items for projectId: ${projectId}, query params:`,
      req.query
    );

    const { items, totalPages } = await getItems(projectId, {
      page,
      limit,
      sortBy,
      order,
    });
    logger.debug(`Retrieved ${items.length} items, totalPages: ${totalPages}`);

    const formattedItems = items.map((item) => {
      return {
        ...item,
        rate: item.rate?.toFixed(4),
      };
    });

    return res.status(OK).json({ items: formattedItems, totalPages });
  }
);

export const searchItemsHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling searchItems request");
    const { page, limit, sortBy, order, q } =
      req.query as SearchItemsQueryParams;
    logger.debug(`Search items with query params:`, req.query);

    const { items, totalPages } = await searchItems({
      page,
      limit,
      sortBy,
      order,
      q,
    });
    logger.debug(
      `Search returned ${items.length} items, totalPages: ${totalPages}`
    );

    const formattedItems = items.map((item) => {
      return {
        ...item,
        rate: item.rate?.toFixed(4),
      };
    });

    return res.status(OK).json({ items: formattedItems, totalPages });
  }
);

export const getItemHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling getItem request");
    const itemIdStr = req.params.itemId as string;
    const itemId = parseInt(itemIdStr);
    logger.debug(`Get item by itemId: ${itemId}`);

    const item = await getItem(itemId);

    appAssert(item, NOT_FOUND, `Item not found with itemId: ${itemId}`);
    logger.debug(`Item found and retrieved: ${itemId}`); 

    return res.status(OK).json({ ...item, rate: item.rate?.toFixed(4) });
  }
);

export const getChildItemsHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling getChildItems request");
    const parentItemIdStr = req.params.parentId as string;
    const parentItemId = parseInt(parentItemIdStr);
    logger.debug(`Get child items for parentItemId: ${parentItemId}`);

    const items = await getChildItems(parentItemId);

    appAssert(
      items,
      NOT_FOUND,
      `Child item not found with itemId: ${parentItemId}`
    );
    logger.debug(
      `Child items found for parentItemId: ${parentItemId}, count: ${items?.length}`
    );

    const formattedItems = items.map((item) => {
      return {
        ...item,
        rate: item.rate?.toFixed(4),
      };
    });

    return res.status(OK).json(formattedItems);
  }
);

export const updateItemHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling updateItem request");
    const itemIdStr = req.params.itemId as string;
    const itemId = parseInt(itemIdStr);
    const data = req.body as UpdateItemInput;
    logger.debug(`Update item itemId: ${itemId}, data:`, data);

    const updatedItem = await updateItem(itemId, data);

    appAssert(updatedItem, NOT_FOUND, `Item not found with itemId: ${itemId}`);
    logger.info(`Item updated successfully with ID: ${itemId}`);

    res.status(OK).json(updatedItem);
  }
);

export const deleteItemHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling deleteItem request");
    const itemIdStr = req.params.itemId as string;
    const itemId = parseInt(itemIdStr);
    logger.debug(`Delete item itemId: ${itemId}`);

    const existingItem = await getItem(itemId);
    appAssert(existingItem, NOT_FOUND, `Item not found with itemId: ${itemId}`);
    logger.debug(`Item found, proceeding with deletion: ${itemId}`);

    await deleteItem(itemId);
    logger.info(`Item deleted successfully with ID: ${itemId}`);

    return res.status(NO_CONTENT).send();
  }
);
