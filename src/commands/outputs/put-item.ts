import type { PutCommandOutput } from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { ifDefined, unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";
import { ItemCollectionMetrics } from "./item-collection-metrics.js";

export type PutItemOutput<T extends Attributes = Attributes> = {
  /**
   * The returned item, if any.
   */
  item?: T;
  /**
   * The returned item collection metrics, if any.
   */
  itemCollectionMetrics?: ItemCollectionMetrics;
  /**
   * The returned consumed capacity, if any.
   */
  consumedCapacity?: ConsumedCapacity;
};

export const PutItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: PutCommandOutput,
): PutItemOutput<T> {
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
