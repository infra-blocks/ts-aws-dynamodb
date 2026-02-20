import type { DeleteTableCommandOutput } from "@aws-sdk/client-dynamodb";

export type DeleteTableOutput = Record<string, never>;

export const DeleteTableOutput = {
  decode,
};

function decode(_: DeleteTableCommandOutput): DeleteTableOutput {
  return {};
}
