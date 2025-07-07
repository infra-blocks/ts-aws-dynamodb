import dotenv from "dotenv";
import { z } from "zod";

// TODO: export this array from logger interface.
const logLevel = z.enum(["trace", "debug", "info", "warn", "error"]);

const schema = z.object({
  AWS_SDK_LOG_LEVEL: logLevel
    .describe("The AWS SDK log level.")
    .default("error"),
  DYNAMODB_ENDPOINT_URL: z.string().describe("The DynamoDB endpoint URL."),
  TEST_LOG_LEVEL: logLevel
    .describe("The test harness log level")
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
