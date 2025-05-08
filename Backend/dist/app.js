import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { fileURLToPath } from "url";
import path from "path";
import morganMiddleware from "./logger/morgan";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
//global middleware
app.use(cors({
    origin: String(process.env.CLIENT_URL).split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
//set security HTTP headers
app.use(helmet());
//parse json request body
app.use(express.json({
    limit: "16kb",
}));
//parse cookie header to req.cookies
app.use(cookieParser());
//parse urlencoded request body with complex data structure
app.use(express.urlencoded({ extended: true }));
//serve static files
app.use(express.static("public"));
//logging http requests
app.use(morganMiddleware);
//API endpoints
/*----Global routes---- */
import healthCheckRouter from "./routes/healthCheck.routes";
import notFoundRouter from "./routes/notFound.routes";
/*----Recipe sharing app---- */
import authRouter from "./routes/Recipe-sharing-app/auth.routes";
import recipesRouter from "./routes/Recipe-sharing-app/recipes.routes";
import usersRouter from "./routes/Recipe-sharing-app/users.routes";
import commentsRouter from "./routes/Recipe-sharing-app/comments.routes";
import notificationsRouter from "./routes/Recipe-sharing-app/notifications.routes";
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/recipes", recipesRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/health-check", healthCheckRouter);
/*----Chat app---- */
//API documentation
const swaggerDoc = YAML.load(`${__dirname}/swagger.yaml`);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(notFoundRouter);
// app.use(errorHandlerMiddleware);
export { app };
