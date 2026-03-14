import type { TransactWriteCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import { unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";
import { ItemCollectionMetrics } from "./item-collection-metrics.js";

export type WriteTransactionOutput = {
  /**
   * The returned consumed capacity, if any.
   */
  consumedCapacity?: Array<ConsumedCapacity>;
  /**
   * The returned item collection metrics, if any.
   */
  itemCollectionMetrics?: ItemCollectionMetrics;
};

export const WriteTransactionOutput = {
  decode,
};

function decode(output: TransactWriteCommandOutput): WriteTransactionOutput {
  return unsetUndefined({
    consumedCapacity: ifDefined(output.ConsumedCapacity, (v) =>
      v.map(ConsumedCapacity.decode),
    ),
    itemCollectionMetrics: ifDefined(
      output.ItemCollectionMetrics,
      ItemCollectionMetrics.decode,
    ),
  });
}
