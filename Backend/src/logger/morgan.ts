import morgan from "morgan";
import logger from "./logger.winston.js";

const format = ":method :url :status :response-time ms";
const morganMiddleware = morgan(format, {
    stream:{
        write: (message) => {
            const logObject = {
              method: message.split(" ")[0],
              url: message.split(" ")[1],
              status: message.split(" ")[2],
              responseTime: `${message.split(" ")[3]}ms`,
            };
            logger.info(JSON.stringify(logObject));
          },
    }
})
export default morganMiddleware;