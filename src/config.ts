import dotenv from "dotenv";

dotenv.config();

interface AWSConfig {
  region: string;
  queueUrl: string;
  topicArn: string;
  profile?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

interface AppConfig {
  batchSize: number;
  visibilityTimeout: number;
  waitTimeSeconds: number;
  pollingWaitTimeMs: number;
  maxRetries: number;
}

interface Config {
  aws: AWSConfig;
  app: AppConfig;
}

const config: Config = {
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    queueUrl: process.env.SQS_QUEUE_URL || "",
    topicArn: process.env.SNS_TOPIC_ARN || "",
    profile: process.env.AWS_PROFILE,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
  app: {
    batchSize: 10,
    visibilityTimeout: 30,
    waitTimeSeconds: 20,
    pollingWaitTimeMs: 1000,
    maxRetries: 3,
  },
};

export default config;
