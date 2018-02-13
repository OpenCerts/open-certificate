const { createLogger, format, transports } = require("winston");

const { combine, timestamp, printf, colorize } = format;

const formatter = printf(
  info => `${info.timestamp} ${info.level}: ${info.message}`
);

const logger = createLogger({
  format: combine(timestamp(), colorize(), formatter),
  level: "debug"
});
// Add console to winston default logger
const addConsole = logLevel => {
  logger.add(
    new transports.Console({
      level: logLevel,
      colorize: true,
      timestamp: true,
      json: false
    })
  );
};

module.exports = {
  addConsole,
  logger,
  default: logger
};
