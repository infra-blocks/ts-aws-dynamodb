import type { UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { ifDefined } from "@infra-blocks/toolkit";
import { trusted } from "@infra-blocks/types";
import type { Attributes } from "../../types.js";
import { unsetUndefined } from "../lib.js";
import { ConsumedCapacity } from "./consumed-capacity.js";
import { ItemCollectionMetrics } from "./item-collection-metrics.js";

export type UpdateItemOutput<T extends Attributes = Attributes> = {
  /**
   * The returned attributes, if any.
   */
  attributes?: T;
  /**
   * The returned consumed capacity, if any.
   */
  consumedCapacity?: ConsumedCapacity;
  /**
   * The returned item collection metrics, if any.
   */
  itemCollectionMetrics?: ItemCollectionMetrics;
};

export const UpdateItemOutput = {
  decode,
};

function decode<T extends Attributes = Attributes>(
  output: UpdateCommandOutput,
): UpdateItemOutput<T> {
  return unsetUndefined({
    attributes: ifDefined(output.Attributes, trusted<T>),
    consumedCapacity: ifDefined(
      output.ConsumedCapacity,
      ConsumedCapacity.decode,
    ),
    itemCollectionMetrics: ifDefined(
      output.ItemCollectionMetrics,
      ItemCollectionMetrics.decode,
    ),
  });
}
