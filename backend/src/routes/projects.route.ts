import { Router } from "express";
import {
  createProjectSchema,
  DeleteProjectSchema,
  getProjectSchema,
  searchProjectSchema,
  UpdateProjectSchema,
} from "../validations/project.validation";
import {
  createProjectHandler,
  DeleteProjectHandler,
  getProjectHandler,
  getProjectsHandler,
  searchProjectHandler,
  UpdateProjectHandler,
} from "../handlers/projects.handler";
import validateRequest from "../middleware/validateRequest";

const projectRouter = Router();

// create a new project
projectRouter.post(
  "/projects",
  validateRequest(createProjectSchema),
  createProjectHandler
);

// List all project for a user (with pagination)
projectRouter.get("/projects", getProjectsHandler);

// Get details of a project (including associated items)
projectRouter.get(
  "/projects/:projectId",
  validateRequest(getProjectSchema),
  getProjectHandler
);

projectRouter.get(
  "/project/search",
  validateRequest(searchProjectSchema),
  searchProjectHandler
);

projectRouter.put(
  "/project/:projectId",
  validateRequest(UpdateProjectSchema),
  UpdateProjectHandler
);
projectRouter.delete(
  "/project/:projectId",
  validateRequest(DeleteProjectSchema),
  DeleteProjectHandler
);

export default projectRouter;
