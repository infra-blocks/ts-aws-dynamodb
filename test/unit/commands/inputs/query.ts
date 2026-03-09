import { suite, test } from "node:test";
import type { QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { expect } from "@infra-blocks/test";
import { QueryInput } from "../../../../src/commands/inputs/index.js";
import { CONSUMED_CAPACITY_RETURN_VALUES } from "../../../../src/commands/inputs/lib.js";
import { beginsWith, literal, path, value } from "../../../../src/index.js";

export const queryTests = () => {
  suite("QueryInput", () => {
    suite(QueryInput.encode.name, () => {
      const expectWorks = (input: QueryInput, expected: QueryCommandInput) => {
        expect(QueryInput.encode(input)).to.deep.equal(expected);
      };

      const minimalInput: QueryInput = {
        table: "toto",
        keyCondition: ["pk", "=", value("toto")],
      };
      const minimalExpected: QueryCommandInput = {
        TableName: "toto",
        KeyConditionExpression: "#attr1 = :value1",
        ExpressionAttributeNames: {
          "#attr1": "pk",
        },
        ExpressionAttributeValues: {
          ":value1": "toto",
        },
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
            FilterExpression: "begins_with(#attr1, :value2)",
            ExpressionAttributeValues: {
              ...minimalExpected.ExpressionAttributeValues,
              ":value2": "t",
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
            ProjectionExpression: "#attr2,#attr3.#attr4,#attr5",
            ExpressionAttributeNames: {
              ...minimalExpected.ExpressionAttributeNames,
              "#attr2": "toto",
              "#attr3": "tata",
              "#attr4": "tutu",
              "#attr5": "joe.cunt",
            },
          },
        );
      });

      for (const v of CONSUMED_CAPACITY_RETURN_VALUES) {
        test(`should work with returnConsumedCapacity: ${v}`, () => {
          expectWorks(
            {
              ...minimalInput,
              returnConsumedCapacity: v,
            },
            {
              ...minimalExpected,
              ReturnConsumedCapacity: v,
            },
          );
        });
      }

      test("should work with scan index forward", () => {
        expectWorks(
          { ...minimalInput, scanIndexForward: false },
          { ...minimalExpected, ScanIndexForward: false },
        );
      });
    });
  });
};
