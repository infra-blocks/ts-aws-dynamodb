import * as childProcess from "node:child_process";
import type { Logger } from "@infra-blocks/logger-interface";
import type { EnvironmentVariables } from "@infra-blocks/types";
import { omit } from "es-toolkit/object";
import { DynamoDbClient } from "../../src/client.js";
import type { TestKit } from "./kit.js";
import type { TestConfig } from "./test-config.js";

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

export const Services = {
  async start(kit: TestKit) {
    kit.logger.info("starting services");
    await init(kit);
    kit.logger.info("services started");
  },
  stop(kit: TestKit) {
    kit.logger.info("stopping services");
    dockerComposeDown(kit);
    kit.logger.info("services stopped");
  },
};
