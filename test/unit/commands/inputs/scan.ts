import { suite, test } from "node:test";
import type { ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { expect } from "@infra-blocks/test";
import { ScanInput } from "../../../../src/commands/inputs/index.js";
import { CONSUMED_CAPACITY_RETURN_VALUES } from "../../../../src/commands/inputs/lib.js";
import { beginsWith, literal, path, value } from "../../../../src/index.js";

export const scanTests = () => {
  suite("ScanInput", () => {
    suite(ScanInput.encode.name, () => {
      const expectWorks = (input: ScanInput, expected: ScanCommandInput) => {
        expect(ScanInput.encode(input)).to.deep.equal(expected);
      };

      const minimalInput: ScanInput = {
        table: "toto",
      };
      const minimalExpected: ScanCommandInput = {
        TableName: "toto",
      };

      test("should work with minimum set of fields", () => {
        expectWorks(minimalInput, minimalExpected);
      });

      test("should work for consistent read", () => {
        expectWorks(
          { ...minimalInput, consistentRead: true },
          { ...minimalExpected, ConsistentRead: true },
        );
      });

      test("should work with exclusive start key", () => {
        expectWorks(
          { ...minimalInput, exclusiveStartKey: { pk: "tutu" } },
          { ...minimalExpected, ExclusiveStartKey: { pk: "tutu" } },
        );
      });

      test("should work with filter", () => {
        expectWorks(
          { ...minimalInput, filter: beginsWith("pk", value("t")) },
          {
            ...minimalExpected,
            FilterExpression: "begins_with(#attr1, :value1)",
            ExpressionAttributeNames: {
              "#attr1": "pk",
            },
            ExpressionAttributeValues: {
              ":value1": "t",
            },
          },
        );
      });

      test("should work with index", () => {
        expectWorks(
          { ...minimalInput, index: "gsi1" },
          { ...minimalExpected, IndexName: "gsi1" },
        );
      });

      test("should work with projection", () => {
        expectWorks(
          {
            ...minimalInput,
            projection: ["toto", path("tata.tutu"), literal("joe.cunt")],
          },
          {
            ...minimalExpected,
            ProjectionExpression: "#attr1,#attr2.#attr3,#attr4",
            ExpressionAttributeNames: {
              "#attr1": "toto",
              "#attr2": "tata",
              "#attr3": "tutu",
              "#attr4": "joe.cunt",
            },
          },
        );
      });

      for (const v of CONSUMED_CAPACITY_RETURN_VALUES) {
        test(`should work with returnConsumedCapacity: ${v}`, () => {
          expectWorks(
            { ...minimalInput, returnConsumedCapacity: v },
            { ...minimalExpected, ReturnConsumedCapacity: v },
          );
        });
      }

      // These should be provided together all the time, even though
      // we don't do the runtime check ourselves. It would simply throw
      // once being processed by the SDK.
      test("should work with segmentation fields", () => {
        expectWorks(
          { ...minimalInput, segment: 0, totalSegments: 10 },
          { ...minimalExpected, Segment: 0, TotalSegments: 10 },
        );
      });
    });
  });
};
