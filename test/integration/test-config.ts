import { LOG_LEVELS } from "@infra-blocks/logger-interface";
import dotenv from "dotenv";
import { z } from "zod";

const schema = z.object({
  AWS_SDK_LOG_LEVEL: z
    .enum(LOG_LEVELS)
    .describe("The AWS SDK log level.")
    .default("error"),
  DYNAMODB_ENDPOINT_URL: z.string().describe("The DynamoDB endpoint URL."),
  LOG_LEVEL: z
    .enum(LOG_LEVELS)
    .describe("The log level of the system under test.")
    .default("info"),
  TEST_LOG_LEVEL: z
    .enum(LOG_LEVELS)
    .describe("The test harness log level.")
    .default("info"),
});

export type TestConfig = z.infer<typeof schema>;

export function injectTestConfig() {
  dotenv.config({
    path: `${import.meta.dirname}/.env.test`,
    quiet: true,
  });
}

export function getTestConfig(): TestConfig {
  return schema.parse(process.env);
}
