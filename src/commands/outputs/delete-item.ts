import type { DeleteCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";
import { ItemCollectionMetrics } from "./item-collection-metrics.js";

export type DeleteItemOutput<T extends Attributes = Attributes> = {
  /**
   * The returned consumed capacity, if any.
   */
  consumedCapacity?: ConsumedCapacity;
  /**
   * The returned item, if any.
   */
  item?: T;
  /**
   * The returned item collection metrics, if any.
   */
  itemCollectionMetrics?: ItemCollectionMetrics;
};

export const DeleteItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: DeleteCommandOutput,
): DeleteItemOutput<T> {
  return unsetUndefined({
    item: ifDefined(output.Attributes, trusted<T>),
    itemCollectionMetrics: ifDefined(
      output.ItemCollectionMetrics,
      ItemCollectionMetrics.decode,
    ),
    consumedCapacity: ifDefined(
      output.ConsumedCapacity,
      ConsumedCapacity.decode,
    ),
  });
}
