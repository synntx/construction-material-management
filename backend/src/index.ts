import express from "express";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import { OK } from "./constants/http";
import projectRouter from "./routes/projects.route";
import itemRouter from "./routes/items.route";
import itemsIoRouter from "./routes/itemsIo.route";
import authRouter from "./routes/auth.route";
import { authenticate } from "./middleware/authMiddleware";
import cors from "cors";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.APP_ORIGIN,
    credentials: true,
  })
);

app.use((req, res, next) => {
  logger.info(`Incoming request - Method: ${req.method}, URL: ${req.url}`);
  next();
});

app.get("/", (_req, res) => {
  logger.info("Handling GET request for / route");
  res.status(OK).json({ error: "Healthy" });
});

app.use("/api/v1", authRouter);
app.use("/api/v1", authenticate, projectRouter);
app.use("/api/v1", authenticate, itemRouter);
app.use("/api/v1", authenticate, itemsIoRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🎆🎇 Server running on port ${PORT}`);
});
