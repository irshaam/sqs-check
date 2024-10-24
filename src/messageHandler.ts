import logger from "./logger";

export async function processMessage(
  messageBody: string
): Promise<{ success: boolean; data: any }> {
  logger.info({ messageBody }, "Processing message");

  try {
    const data = JSON.parse(messageBody);
    return { success: true, data };
  } catch (error) {
    logger.error("Message processing failed", {
      error: (error as Error).message,
      messageBody,
    });
    throw error;
  }
}
