import type { CreateTableCommandOutput } from "@aws-sdk/client-dynamodb";

export type CreateTableOutput = Record<string, never>;

export const CreateTableOutput = {
  decode,
};

function decode(_: CreateTableCommandOutput): CreateTableOutput {
  return {};
}
