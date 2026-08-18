const formatLog = (level, message, meta = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (meta && typeof meta === "object" && Object.keys(meta).length > 0) {
    payload.meta = meta;
  }

  return JSON.stringify(payload);
};

const log = (level, message, meta = {}) => {
  const line = formatLog(level, message, meta);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
};

module.exports = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
};
