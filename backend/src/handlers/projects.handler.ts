import catchErrors from "../utils/catchErrors";
import {
  createProject,
  DeleteProject,
  getProject,
  getProjects,
  SearchProjectQueryParams,
  searchProjects,
  UpdateProject,
} from "../services/projects.service";
import {
  BAD_REQUEST,
  CREATED,
  INTERNAL_SERVER_ERROR,
  OK,
  UNAUTHORIZED,
} from "../constants/http";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import appAssert from "../utils/assert";
import logger from "../utils/logger";

export const createProjectHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling createProject request");
    const { name }: { name: string } = req.body;
    const userId = req.user?.id;
    logger.debug(
      `Create project request from userId: ${userId}, projectName: ${name}`
    );

    appAssert(userId, UNAUTHORIZED, "user not authorized");

    const project = await createProject(name, userId);
    logger.info(
      `Project created successfully with ID: ${project.id} by userId: ${userId}`
    );

    return res.status(CREATED).json(project);
  }
);

// TODO: Add pagination
export const getProjectsHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling getProjects request");
    const userId = req.user?.id;
    logger.debug(`Get projects request for userId: ${userId}`);

    appAssert(userId, UNAUTHORIZED, "user not authorized");

    const projects = await getProjects(userId);
    logger.debug(`Retrieved ${projects.length} projects for userId: ${userId}`);

    res.status(OK).json(projects);
  }
);

export const getProjectHandler = catchErrors(
  async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    logger.info("Handling getProject request");
    const { projectId } = req.params;
    logger.debug(`Get project request for projectId: ${projectId}`);

    appAssert(projectId, BAD_REQUEST, "project id is required");

    const project = await getProject(projectId);
    logger.debug(`Project retrieved successfully for projectId: ${projectId}`);

    res.status(OK).json(project);
  }
);

export const searchProjectHandler = catchErrors(
  async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    logger.info("Handling searchProject request");
    const { page, limit, q } = req.query as SearchProjectQueryParams;
    logger.debug(`Search projects request with query params:`, req.query);

    const { projects, totalPages } = await searchProjects({
      page,
      limit,
      q,
    });
    logger.debug(
      `Search projects returned ${projects.length} projects, totalPages: ${totalPages}`
    );

    return res.status(OK).json({ projects, totalPages });
  }
);

export const UpdateProjectHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling UpdateProject request");
    const { name }: { name: string } = req.body;
    const projectId = req.params.projectId as string;
    logger.debug(
      `Update project request for projectId: ${projectId}, newName: ${name}`
    );

    const project = await UpdateProject(projectId, name);
    logger.info(`Project updated successfully for projectId: ${projectId}`);

    return res.status(OK).json(project);
  }
);

export const DeleteProjectHandler = catchErrors(
  async (
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    logger.info("Handling DeleteProject request");
    const projectId = req.params.projectId as string;
    logger.debug(`Delete project request for projectId: ${projectId}`);

    const IsDeleted = await DeleteProject(projectId);

    appAssert(IsDeleted, INTERNAL_SERVER_ERROR, "Unable to delete the project");
    logger.info(`Project deleted successfully for projectId: ${projectId}`);

    return res.status(OK).json({ message: "Project deleted successfully" });
  }
);
