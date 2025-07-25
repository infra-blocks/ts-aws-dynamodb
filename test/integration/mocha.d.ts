import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDbClient } from "../../src/client.ts";
import type { TestConfig } from "./test-config.ts";
import type { Logger } from "@infra-blocks/logger-interface";

declare module "mocha" {
  export interface Context {
    logger: Logger;
    config: TestConfig;
    createClient(): DynamoDbClient;
    createTestClient(): DynamoDBClient;
  }
}
