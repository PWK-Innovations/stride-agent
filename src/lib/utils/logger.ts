import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

/** Log function entry — action name + input arguments */
function logToolEntry(
  toolName: string,
  args: Record<string, unknown>,
): void {
  logger.info(
    { action: toolName, input: args },
    `[${toolName}] Tool invoked`,
  );
}

/** Log function exit — action name + result + success status */
function logToolCall(
  toolName: string,
  args: Record<string, unknown>,
  result: string,
): void {
  const truncatedResult =
    result.length > 200 ? result.slice(0, 200) + "..." : result;

  logger.info(
    { action: toolName, input: args, result: truncatedResult, success: true },
    `[${toolName}] Tool completed`,
  );
}

/** Log error — action name + error message + stack trace + original input */
function logToolError(
  toolName: string,
  args: Record<string, unknown>,
  error: string | Error,
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(
    { action: toolName, input: args, error: errorMessage, stack },
    `[${toolName}] Tool error`,
  );
}

export { logger, logToolEntry, logToolCall, logToolError };
