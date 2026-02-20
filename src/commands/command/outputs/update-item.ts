import type { UpdateItemCommandOutput } from "@aws-sdk/client-dynamodb";

export type UpdateItemOutput = Record<string, never>;

export function decode(_: UpdateItemCommandOutput): UpdateItemOutput {
  return {};
}
