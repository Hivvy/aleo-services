import { createLogger, format, transports } from "winston";
import path from "path";

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

// Create the logger
const logger = createLogger({
    level: "info",
    format: combine(timestamp(), myFormat),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: path.join("./logs", "logfile.log"),
        }),
    ],
});

export default logger;
