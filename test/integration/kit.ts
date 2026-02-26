import { afterEach } from "node:test";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { Logger } from "@infra-blocks/logger-interface";
import { ConsoleLogger } from "@infra-blocks/node-console-logger";
import { DynamoDbClient } from "../../src/index.js";
import { dropAllTables } from "./fixtures.js";
import type { TestConfig } from "./test-config.js";

export interface TestKit {
  config: TestConfig;
  logger: Logger;
  afterEach: {
    dropTables: () => void;
  };
  createClient: () => DynamoDbClient;
  createSdkClient: () => DynamoDBClient;
}

export const TestKit = {
  init(config: TestConfig): TestKit {
    const logger = ConsoleLogger.create({
      name: "test:integration",
      level: config.TEST_LOG_LEVEL,
    });
    const clientLogger = ConsoleLogger.create({
      name: "dynamodb",
      level: config.LOG_LEVEL,
    });
    const awsSdkLogger = ConsoleLogger.create({
      name: "aws-sdk",
      level: config.AWS_SDK_LOG_LEVEL,
    });

    const kit = {
      config,
      logger,
      createClient: () =>
        DynamoDbClient.create({
          dynamodb: { endpoint: config.DYNAMODB_ENDPOINT_URL },
          logger: clientLogger,
        }),
      createSdkClient: () =>
        new DynamoDBClient({
          endpoint: config.DYNAMODB_ENDPOINT_URL,
          logger: awsSdkLogger,
        }),
    };

    return {
      ...kit,
      afterEach: {
        dropTables: () => {
          afterEach(() => dropAllTables(kit.createSdkClient()));
        },
      },
    };
  },
};
