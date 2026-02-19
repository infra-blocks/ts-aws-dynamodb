import type { CreateTableCommandOutput } from "@aws-sdk/client-dynamodb";

export type CreateTableOutput = Record<string, never>;

export function decode(_: CreateTableCommandOutput): CreateTableOutput {
  return {};
}
