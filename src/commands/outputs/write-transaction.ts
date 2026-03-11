import type { TransactWriteCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import { unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";

export type WriteTransactionOutput = {
  consumedCapacity?: Array<ConsumedCapacity>;
};

export const WriteTransactionOutput = {
  decode,
};

function decode(output: TransactWriteCommandOutput): WriteTransactionOutput {
  return unsetUndefined({
    consumedCapacity: ifDefined(output.ConsumedCapacity, (v) =>
      v.map(ConsumedCapacity.decode),
    ),
  });
}
