import * as childProcess from "node:child_process";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { Logger } from "@infra-blocks/logger-interface";
import { ConsoleLogger } from "@infra-blocks/node-console-logger";
import type { EnvironmentVariables } from "@infra-blocks/types";
import { omit } from "radash";
import { DynamoDbClient } from "../../src/client.js";
import {
  getTestConfig,
  injectTestConfig,
  type TestConfig,
} from "./test-config.js";

const CURRENT_DIR = import.meta.dirname;

function runSync(
  command: string,
  options: childProcess.ExecSyncOptions & { logger: Logger },
): void {
  const { logger } = options;
  logger.info(`running command: ${command}`);
  childProcess.execSync(command, {
    ...omit(options, ["logger"]),
  });
}

function dockerComposeUp(params: {
  env?: EnvironmentVariables;
  logger: Logger;
}): void {
  runSync("docker compose up --build -d", { ...params, cwd: CURRENT_DIR });
}

function dockerComposeDown(params: { logger: Logger }): void {
  runSync("docker compose down", { ...params, cwd: CURRENT_DIR });
}

async function init(params: {
  config: TestConfig;
  logger: Logger;
}): Promise<void> {
  const { logger, config } = params;

  const { DYNAMODB_ENDPOINT_URL } = config;
  const dynamoDbPort = new URL("", DYNAMODB_ENDPOINT_URL).port;

  logger.info("starting services");
  dockerComposeUp({
    env: {
      DYNAMODB_PORT: dynamoDbPort,
      PATH: process.env.PATH,
    },
    logger,
  });
  const dynamoDbClient = DynamoDbClient.create({
    dynamodb: { endpoint: DYNAMODB_ENDPOINT_URL },
    logger,
  });
  await dynamoDbClient.ready().on("attempt", ({ attempt }) => {
    logger.info(`attempt #${attempt} at connecting to DynamoDB`);
  });
}

function tearDown(params: { logger: Logger }): void {
  const { logger } = params;
  logger.info("stopping services");
  dockerComposeDown({ logger });
}

before("test suite setup", async function () {
  injectTestConfig();
  const config = getTestConfig();
  const logger = ConsoleLogger.create({
    name: "test:integration",
    level: config.TEST_LOG_LEVEL,
  });
  await init({ logger, config });

  this.config = config;
  this.logger = logger;
  const clientLogger = ConsoleLogger.create({
    name: "dynamodb",
    level: config.TEST_LOG_LEVEL,
  });
  this.createClient = () =>
    DynamoDbClient.create({
      dynamodb: { endpoint: config.DYNAMODB_ENDPOINT_URL },
      logger: clientLogger,
    });
  const testClientLogger = ConsoleLogger.create({
    name: "aws-sdk",
    level: config.AWS_SDK_LOG_LEVEL,
  });
  this.createTestClient = () =>
    new DynamoDBClient({
      endpoint: config.DYNAMODB_ENDPOINT_URL,
      logger: testClientLogger,
    });
  logger.info("setup complete");
});

after("test suite teardown", function () {
  tearDown({ logger: this.logger });
  this.logger.info("teardown complete");
});
