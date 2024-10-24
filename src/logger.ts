import pino from "pino";

const logger = pino({
  level: "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
    },
  },
});

export default logger;
