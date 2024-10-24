# AWS SQS Consumer and SNS Publisher

This project contains two main components:

1. An SQS consumer that processes messages from an AWS SQS queue
2. An SNS message publisher that sends messages to an AWS SNS topic

## SQS Consumer (index.js)

The SQS consumer is responsible for reading messages from an AWS SQS queue, processing them, and deleting them upon successful processing.

### Features

- Configurable AWS credentials (profile or static credentials)
- Enhanced message deletion with retries
- Queue health checks
- Error handling and logging
- Graceful shutdown

### Usage

To start the SQS consumer:

```
Make sure to set up your configuration in `config.js` and implement the `processMessage` function in `messageHandler.js`.

## SNS Message Tracker (sns-message-tracker.js)

The SNS Message Tracker is a command-line tool for publishing messages to an AWS SNS topic and tracking their delivery.

### Features

- Publishes messages to a specified SNS topic
- Adds tracking ID and timestamp to each message
- Verifies topic statistics after publishing
- Colorful console output

### Usage

To publish a message:

```

## Installation

1. Clone the repository
2. Install dependencies:

````
3. Set up your AWS credentials (either through AWS CLI or by providing them in the config file)
4. Configure the `config.js` file with your AWS and application settings

## Dependencies

- @aws-sdk/client-sqs
- @aws-sdk/client-sns
- sqs-consumer
- chalk

## Configuration

Ensure you have a `config.js` file with the following structure:

```javascript
const config = {
  aws: {
    region: 'your-aws-region',
    profile: 'your-aws-profile',
    credentials: {
      accessKeyId: 'your-aws-access-key-id', // optional
      secretAccessKey: 'your-aws-secret-access-key' // optional
    },
    queueUrl: "your-sqs-queue-url",
    topicArn: "your-sns-topic-arn",
  },
  app: {
    batchSize: 10,
    visibilityTimeout: 30,
    waitTimeSeconds: 20,
    pollingWaitTimeMs: 1000,
    maxRetries: 3
  }
};

````

## Logging

The application uses a custom logger (implemented in `logger.js`). Make sure to implement this logger or replace it with your preferred logging solution.

## Error Handling

Both the SQS consumer and SNS publisher have error handling mechanisms in place. Errors are logged and, in the case of the SQS consumer, can trigger message retention in the queue.

## Graceful Shutdown

The SQS consumer implements a graceful shutdown mechanism, stopping message processing when receiving SIGTERM or SIGINT signals.

## Contributing

Feel free to submit issues or pull requests if you have suggestions for improvements or find any bugs.
