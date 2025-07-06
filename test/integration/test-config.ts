import dotenv from "dotenv";
import { z } from "zod";

const schema = z.object({
  DYNAMODB_ENDPOINT_URL: z.string().describe("The DynamoDB endpoint URL."),
  TEST_LOG_LEVEL: z
    // TODO: export this array from logger interface.
    .enum(["trace", "debug", "info", "warn", "error"])
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
