import { config } from "dotenv";
import { app } from "./app";
import logger from "./logger/logger.winston";
import connectMongoDb from "./config/database/mongo/index.js";
config({
    path: "./.env",
});
const port = process.env.PORT || 3000;
app.listen(port, () => connectMongoDb().then(() => logger.info(`✔️ Server is running on http://localhost:${port}`)));
