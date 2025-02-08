import { BasicItem, Prisma, SubType } from "@prisma/client";
import prisma from "../prismaClient";
import { generateChildCode, generateParentCode } from "../utils/code";
import { CreateItemInput } from "../validations/item.validation";
import appAssert from "../utils/assert";
import { NOT_FOUND } from "../constants/http";

export const createItem = async (data: CreateItemInput): Promise<BasicItem> => {
  return prisma.$transaction(async (tx) => {
    let code: string;

    if (data.parentItemId) {
      const parentItem = await tx.basicItem.findUnique({
        where: { id: data.parentItemId },
        select: { code: true, projectId: true },
      });

      if (!parentItem) {
        throw new Error(`Parent item with id ${data.parentItemId} not found`);
      }
      if (parentItem.projectId !== data.projectId) {
        throw new Error(
          `Parent item with id ${data.parentItemId} is not in the same project.`
        );
      }
      const parentCode = parentItem.code;

      const lastChildItem = await tx.basicItem.findFirst({
        where: { parentItemId: data.parentItemId, projectId: data.projectId },
        orderBy: { code: "desc" },
      });

      const lastChildCode = lastChildItem?.code;
      code = generateChildCode(parentCode, lastChildCode);
    } else {
      const lastParentItem = await tx.basicItem.findFirst({
        where: { subType: data.subType, projectId: data.projectId },
        orderBy: { code: "desc" },
      });
      const lastCode = lastParentItem?.code;
      code = generateParentCode(data.subType, lastCode as string | undefined);
    }

    const basicItem = await tx.basicItem.create({
      data: { ...data, code },
    });
    return basicItem;
  });
};

export interface GetItemsQueryParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  q?: string;
  subType?: string;
  minLeadTime?: string;
  maxLeadTime?: string;
  minRate?: string;
  maxRate?: string;
}

export const getItems = async (
  projectId: string,
  qp: GetItemsQueryParams = {} // qp = queryParam
): Promise<{ items: BasicItem[]; totalPages: number }> => {
  const page = qp.page ? parseInt(qp.page) : 1;
  const limit = qp.limit ? parseInt(qp.limit) : 10;
  const skip = (page - 1) * limit;

  const sortField = qp.sortBy || "code";
  const sortOrder: "asc" | "desc" = qp.order === "desc" ? "desc" : "asc";

  const avgMinLeadTime = qp.minLeadTime ? parseInt(qp.minLeadTime) : undefined;
  const avgMaxLeadTime = qp.maxLeadTime ? parseInt(qp.maxLeadTime) : undefined;

  const minRate = qp.minRate ? parseFloat(qp.minRate) : undefined;
  const maxRate = qp.maxRate ? parseFloat(qp.maxRate) : undefined;

  const where: Prisma.BasicItemWhereInput = {
    projectId,
    parentItemId: null,
  };

  // parse subtypes ?subType=civil,ohe
  if (qp.subType) {
    where.subType = { in: qp.subType.split(",") as SubType[] };
  }

  if (avgMaxLeadTime !== undefined) {
    where.avgLeadTime = { ...where, lte: avgMinLeadTime };
  }
  if (avgMinLeadTime !== undefined) {
    where.avgLeadTime = { ...where, gte: avgMinLeadTime };
  }

  if (minRate !== undefined) {
    where.rate = { ...where, lte: minRate };
  }
  if (maxRate !== undefined) {
    where.rate = { ...where, gte: maxRate };
  }

  if (qp.q) {
    where.OR = [
      { name: { contains: qp.q, mode: Prisma.QueryMode.insensitive } },
      { code: { contains: qp.q, mode: Prisma.QueryMode.insensitive } },
    ];
  }

  const [items, totalItems] = await Promise.all([
    prisma.basicItem.findMany({
      where,
      take: limit,
      skip: skip,
      orderBy: {
        [sortField]: sortOrder ?? Prisma.SortOrder.asc,
      },
    }),
    prisma.basicItem.aggregate({
      where,
      _count: {
        _all: true,
      },
    }),
  ]);

  appAssert(items, NOT_FOUND, `items not found`);

  return { items, totalPages: Math.ceil(totalItems._count._all / limit) };
};

export interface SearchItemsQueryParams extends GetItemsQueryParams {
  q?: string;
}

export const searchItems = async (
  queryParams: SearchItemsQueryParams = {}
): Promise<{ items: BasicItem[]; totalPages: number }> => {
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const sortField = queryParams.sortBy || "name";
  const sortOrder: "asc" | "desc" =
    queryParams.order === "desc" ? "desc" : "asc";

  const whereCondition: Prisma.BasicItemWhereInput = {
    OR: queryParams.q
      ? [
          {
            name: {
              contains: queryParams.q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            code: {
              contains: queryParams.q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ]
      : undefined,
  };

  const totalItems = await prisma.basicItem.count({ where: whereCondition });

  const items = await prisma.basicItem.findMany({
    where: whereCondition,
    take: limit,
    skip: skip,
    orderBy: {
      [sortField]: sortOrder,
    },
  });

  appAssert(items, NOT_FOUND, `items not found`);

  return { items, totalPages: Math.ceil(totalItems / limit) };
};

export const getItem = async (
  itemId: number
): Promise<(BasicItem & { childItems: BasicItem[] }) | null> => {
  const item = await prisma.basicItem.findFirst({
    where: {
      id: itemId,
    },
    include: {
      childItems: true,
    },
  });
  return item;
};

export const getChildItems = async (
  parentItemId: number
): Promise<BasicItem[] | null> => {
  const item = await prisma.basicItem.findMany({
    where: {
      parentItemId: parentItemId,
    },
  });
  appAssert(item, NOT_FOUND, `items not found`);
  return item;
};

export type UpdateItemInput = Partial<CreateItemInput>;

export const updateItem = async (
  itemId: number,
  data: UpdateItemInput
): Promise<BasicItem> => {
  const item = await prisma.basicItem.update({
    where: { id: itemId },
    data,
  });
  return item;
};

export const deleteItem = async (itemId: number): Promise<BasicItem> => {
  const item = await prisma.basicItem.delete({
    where: { id: itemId },
  });
  return item;
};
