type LogContext = Record<string, unknown>;

const serialize = (context?: LogContext) => {
  if (!context || Object.keys(context).length === 0) {
    return "";
  }

  return ` ${JSON.stringify(context)}`;
};

export const logger = {
  error(message: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.error(`[error] ${message}${serialize(context)}`);
  },
  info(message: string, context?: LogContext) {
    // eslint-disable-next-line no-console
    console.info(`[info] ${message}${serialize(context)}`);
  },
};
