#!/usr/bin/env node

import {
  SNSClient,
  PublishCommand,
  GetTopicAttributesCommand,
} from "@aws-sdk/client-sns";
import chalk from "chalk";
import config from "./config";

const sns = new SNSClient({});

async function publishAndVerify(
  message: string
): Promise<{ MessageId: string; trackingId: string }> {
  console.log(chalk.blue("\n📤 Publishing message to user-notifications..."));

  try {
    const trackingId = Date.now().toString();
    const publishCommand = new PublishCommand({
      TopicArn: config.aws.topicArn,
      Message: message,
      MessageAttributes: {
        TrackingId: {
          DataType: "String",
          StringValue: trackingId,
        },
        Timestamp: {
          DataType: "String",
          StringValue: new Date().toISOString(),
        },
      },
    });

    const { MessageId } = await sns.send(publishCommand);
    console.log(chalk.green("✓ Message published successfully"));
    console.log(chalk.blue(`MessageId: ${MessageId}`));
    console.log(chalk.blue(`TrackingId: ${trackingId}`));

    const topicAttrs = await sns.send(
      new GetTopicAttributesCommand({
        TopicArn: config.aws.topicArn,
      })
    );

    console.log(chalk.blue("\n📈 Topic Statistics:"));
    console.log(chalk.blue("================="));
    console.log(
      `Subscriptions Confirmed: ${chalk.green(
        topicAttrs.Attributes?.SubscriptionsConfirmed
      )}`
    );
    console.log(
      `Subscriptions Pending: ${chalk.yellow(
        topicAttrs.Attributes?.SubscriptionsPending
      )}`
    );

    return { MessageId: MessageId!, trackingId };
  } catch (error) {
    console.log(chalk.red("❌ Error:", (error as Error).message));
    process.exit(1);
  }
}

if (require.main === module) {
  const message = process.argv[2];
  if (!message) {
    console.log(chalk.red("Please provide a message to publish"));
    console.log(
      chalk.yellow(
        'Usage: ts-node src/sns-message-tracker.ts "Your message here"'
      )
    );
    process.exit(1);
  }
  publishAndVerify(message);
}

export { publishAndVerify };
