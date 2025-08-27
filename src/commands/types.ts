import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export interface Command<Output> {
  execute(client: DynamoDBDocumentClient): Promise<Output>;
  getName(): string;
  getDetails(): object;
}
