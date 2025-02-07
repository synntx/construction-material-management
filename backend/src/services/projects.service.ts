import { Prisma, Project } from "@prisma/client";
import prisma from "../prismaClient";
import appAssert from "../utils/assert";
import { NOT_FOUND } from "../constants/http";

export const createProject = async (
  projectName: string,
  userId: string
): Promise<Project> => {
  const project = await prisma.project.create({
    data: {
      name: projectName,
      userId: userId,
    },
  });

  appAssert(project, NOT_FOUND, `project not found`);
  return project;
};

export const getProjects = async (userId: string): Promise<Project[]> => {
  const projects = await prisma.project.findMany({
    where: {
      userId: userId,
    },
  });

  appAssert(projects, NOT_FOUND, `projects not found`);
  return projects;
};

export const getProject = async (projectId: string): Promise<Project> => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
    },
  });

  appAssert(
    project,
    NOT_FOUND,
    `project not found with project id ${projectId}`
  );

  return project;
};

export interface SearchProjectQueryParams {
  page?: string | number;
  limit?: string | number;
  q?: string;
}

export const searchProjects = async (
  queryParams: SearchProjectQueryParams = {}
): Promise<{ projects: Project[]; totalPages: number }> => {
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  const whereCondition: Prisma.ProjectWhereInput = {
    OR: queryParams.q
      ? [
          {
            name: {
              contains: queryParams.q,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ]
      : undefined,
  };

  const totalProjects = await prisma.project.count({ where: whereCondition });

  const projects = await prisma.project.findMany({
    where: whereCondition,
    take: limit,
    skip: skip,
  });

  appAssert(projects, NOT_FOUND, `projects not found`);

  return { projects, totalPages: Math.ceil(totalProjects / limit) };
};

export const UpdateProject = async (
  projectId: string,
  name: string
): Promise<Project> => {
  const project = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name,
    },
  });

  appAssert(project, NOT_FOUND, `project not found`);
  return project;
};

export const DeleteProject = async (projectId: string) => {
  const project = await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  appAssert(project, NOT_FOUND, `project not found`);
  return true
};
