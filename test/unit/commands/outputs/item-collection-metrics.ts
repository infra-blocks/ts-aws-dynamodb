import assert from "node:assert/strict";
import { suite, test } from "node:test";
import { omit } from "es-toolkit";
import {
  ItemCollectionMetrics,
  type NativeItemCollectionMetrics,
} from "../../../../src/commands/outputs/item-collection-metrics.js";

export const itemCollectionMetricsTests = () => {
  suite("ItemCollectionMetrics", () => {
    const expectFails = (output: NativeItemCollectionMetrics) =>
      assert.throws(() => ItemCollectionMetrics.decode(output));
    const expectWorks = (
      output: NativeItemCollectionMetrics,
      expected: ItemCollectionMetrics,
    ) => assert.deepEqual(ItemCollectionMetrics.decode(output), expected);

    const minimalOutput: NativeItemCollectionMetrics = {
      ItemCollectionKey: {
        pk: "toto",
      },
      // Somewhere between you have nothing and you have too much.
      SizeEstimateRangeGB: [0, 10],
    };
    const minimalExpected: ItemCollectionMetrics = {
      itemCollectionKey: {
        pk: "toto",
      },
      sizeEstimateRangeGb: [0, 10],
    };

    test("should throw for missing key", () => {
      expectFails(omit(minimalOutput, ["ItemCollectionKey"]));
    });

    test("should throw for missing size estimate", () => {
      expectFails(omit(minimalOutput, ["SizeEstimateRangeGB"]));
    });

    test("should work with minimal fields set", () => {
      expectWorks(minimalOutput, minimalExpected);
    });
  });
};
