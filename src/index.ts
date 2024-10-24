import {
  SQSClient,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
} from "@aws-sdk/client-sqs";
import { Consumer } from "sqs-consumer";
import config from "./config";
import logger from "./logger";
import { processMessage } from "./messageHandler";

const getSQSClient = (): SQSClient => {
  const clientConfig: any = {
    region: config.aws.region,
  };

  if (config.aws.profile) {
    logger.info("Using AWS Profile for credentials");
  } else if (
    config.aws.credentials?.accessKeyId &&
    config.aws.credentials?.secretAccessKey
  ) {
    logger.info("Using static credentials");
    clientConfig.credentials = config.aws.credentials;
  } else {
    throw new Error("No valid AWS credentials found");
  }

  return new SQSClient(clientConfig);
};

const sqs = getSQSClient();

async function deleteMessage(receiptHandle: string): Promise<void> {
  const deleteParams = {
    QueueUrl: config.aws.queueUrl,
    ReceiptHandle: receiptHandle,
  };

  for (let attempt = 1; attempt <= config.app.maxRetries; attempt++) {
    try {
      const deleteCommand = new DeleteMessageCommand(deleteParams);
      await sqs.send(deleteCommand);
      logger.info("Message deleted successfully", { attempt });
      return;
    } catch (error) {
      logger.error("Delete attempt failed", {
        attempt,
        error: (error as Error).message,
      });
      if (attempt === config.app.maxRetries) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 100)
      );
    }
  }
}

async function checkQueueHealth(): Promise<void> {
  try {
    const command = new GetQueueAttributesCommand({
      QueueUrl: config.aws.queueUrl,
      AttributeNames: ["ApproximateNumberOfMessages"],
    });
    const response = await sqs.send(command);
    logger.info("Queue health check", {
      approximateNumberOfMessages:
        response.Attributes?.ApproximateNumberOfMessages,
    });
  } catch (error) {
    logger.error("Queue health check failed", {
      error: (error as Error).message,
    });
  }
}

const app = Consumer.create({
  queueUrl: config.aws.queueUrl,
  handleMessage: async (message) => {
    try {
      logger.info("Received message", {
        messageId: message.MessageId,
        timestamp: new Date().toISOString(),
      });

      await processMessage(message.Body!);
      await deleteMessage(message.ReceiptHandle!);
    } catch (error) {
      logger.error("Message handling failed", {
        error: (error as Error).message,
        messageId: message.MessageId,
      });
      throw error;
    }
  },
  sqs,
  batchSize: config.app.batchSize,
  visibilityTimeout: config.app.visibilityTimeout,
  waitTimeSeconds: config.app.waitTimeSeconds,
  attributeNames: ["All"],
  messageAttributeNames: ["All"],
  pollingWaitTimeMs: config.app.pollingWaitTimeMs,
});

app.on("error", (err) => {
  logger.error("Consumer error", { error: err.message });
});

app.on("processing_error", (err, message) => {
  logger.error("Processing error", {
    error: err.message,
    messageId: message?.MessageId,
  });
});

app.on("timeout_error", (err, message) => {
  logger.error("Timeout error", {
    error: err.message,
    messageId: message?.MessageId,
  });
});

async function shutdown(): Promise<void> {
  logger.info("Shutting down consumer...");
  await app.stop();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

async function start(): Promise<void> {
  try {
    await checkQueueHealth();
    app.start();
    logger.info("Consumer started", { queueUrl: config.aws.queueUrl });
    setInterval(checkQueueHealth, 5 * 60 * 1000);
  } catch (error) {
    logger.error("Failed to start consumer", {
      error: (error as Error).message,
    });
    process.exit(1);
  }
}

start();

logger.info("Application started");
logger.debug("This is a debug message", { someKey: "someValue" });
logger.warn("This is a warning message");
logger.error("This is an error message", { error: new Error("Test error") });
