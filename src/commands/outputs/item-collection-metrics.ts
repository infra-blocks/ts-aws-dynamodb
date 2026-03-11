import assert from "node:assert/strict";
import type * as sdk from "@aws-sdk/client-dynamodb";
import { checkNotNull } from "@infra-blocks/checks";
import { trusted } from "@infra-blocks/types";
import { flow } from "es-toolkit";
import type {
  AttributeName,
  AttributeValue,
  KeyAttributeValue,
} from "../../types.js";
import { unsetUndefined } from "../lib.js";

// This is equivalent to how they define ItemCollectionMetrics in lib dynamodb's types.
// Exported mainly for testing purposes, should not be visible outside the package.
export type NativeItemCollectionMetrics = Omit<
  sdk.ItemCollectionMetrics,
  "ItemCollectionKey"
> & {
  ItemCollectionKey?: Record<AttributeName, AttributeValue>;
};

/**
 * A type describing the item collection metrics returned upon request using the `input.returnItemCollectionMetrics`
 * option.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_ItemCollectionMetrics.html
 */
export type ItemCollectionMetrics = {
  /**
   * The partition key value of the item collection.
   */
  itemCollectionKey: {
    [k: AttributeName]: KeyAttributeValue;
  };
  /**
   * A range of the item collection size with lower and upper bounds.
   */
  sizeEstimateRangeGb: [number, number];
};

export const ItemCollectionMetrics = {
  decode(output: NativeItemCollectionMetrics): ItemCollectionMetrics {
    const decodeSizeEstimate = flow(checkNotNull, decodeSizeRange);

    return unsetUndefined({
      // The type declaration of the native API here is incorrect. As this is a partition key,
      // the type of the value it can have is indeed KeyAttributeValue and not any AttributeValue.
      // So that's why we cast here.
      itemCollectionKey: trusted(checkNotNull(output.ItemCollectionKey)),
      sizeEstimateRangeGb: decodeSizeEstimate(output.SizeEstimateRangeGB),
    });
  },
};

function decodeSizeRange(value: number[]): [number, number] {
  assert(value.length === 2);
  return [value[0], value[1]];
}
