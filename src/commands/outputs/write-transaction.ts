import type { TransactWriteCommandOutput } from "@aws-sdk/lib-dynamodb";

export type WriteTransactionOutput = Record<string, never>;

export const WriteTransactionOutput = {
  decode,
};

function decode(_: TransactWriteCommandOutput): WriteTransactionOutput {
  return {};
}
