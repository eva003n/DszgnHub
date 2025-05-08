import { app } from "./app.js";
import logger from "./logger/logger.winston.js";
import { PORT } from "./config/env.js";

const port = PORT || 8800;

app.listen(port, () =>
    logger.info(`✔️ Server is running on http://localhost:${port}`)
  
);
