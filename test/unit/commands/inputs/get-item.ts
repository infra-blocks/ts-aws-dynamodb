import { suite, test } from "node:test";
import type { GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { expect } from "@infra-blocks/test";
import { GetItemInput } from "../../../../src/commands/inputs/index.js";
import { CONSUMED_CAPACITY_RETURN_VALUES } from "../../../../src/commands/inputs/lib.js";
import { literal, path } from "../../../../src/index.js";

export const getItemTests = () => {
  suite("GetItemInput", () => {
    suite(GetItemInput.encode.name, () => {
      const expectWorks = (input: GetItemInput, expected: GetCommandInput) => {
        expect(GetItemInput.encode(input)).to.deep.equal(expected);
      };

      const minimalInput = {
        table: "toto",
        key: { pk: "word", sk: "pop" },
      };
      const minimalExpected = {
        TableName: "toto",
        Key: {
          pk: "word",
          sk: "pop",
        },
      };

      test("should work with minimum set of fields", () => {
        expectWorks(minimalInput, minimalExpected);
      });

      for (const value of CONSUMED_CAPACITY_RETURN_VALUES) {
        test(`should work with returnConsumedCapacity: ${value}`, () => {
          expectWorks(
            {
              ...minimalInput,
              returnConsumedCapacity: value,
            },
            {
              ...minimalExpected,
              ReturnConsumedCapacity: value,
            },
          );
        });
      }

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

      test("should work with all fields set", () => {
        expectWorks(
          {
            ...minimalInput,
            projection: ["toto", "list[4]"],
            returnConsumedCapacity: "INDEXES",
          },
          {
            ...minimalExpected,
            ProjectionExpression: "#attr1,#attr2[4]",
            ExpressionAttributeNames: {
              "#attr1": "toto",
              "#attr2": "list",
            },
            ReturnConsumedCapacity: "INDEXES",
          },
        );
      });
    });
  });
};
