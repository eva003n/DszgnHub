import { createLogger, format,  transports, } from "winston";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

//if node env is in developement mode set the severity mode to all levels otherwise to warn and error
const modeLevel = process.env.NODE_ENV === "development" ? "debug" : "warn";

const consoleLogFormat = format.combine(

  format.timestamp({ format: "DD-MMm-YYYY HH:mm:ss:ms" }),
  format.align(),
  format.prettyPrint(),
  format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
  format.colorize({all: true}),
);

const logger = createLogger({
  levels: logLevels,
  level:  "info",
  format: consoleLogFormat,
  transports: [
    new transports.Console(),
    new transports.File({ filename: "app.log" }),
  ],
});

export default logger;
