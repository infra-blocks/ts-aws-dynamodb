import type { DeleteTableCommandOutput } from "@aws-sdk/client-dynamodb";

export type DeleteTableOutput = Record<string, never>;

export function decode(_: DeleteTableCommandOutput): DeleteTableOutput {
  return {};
}
