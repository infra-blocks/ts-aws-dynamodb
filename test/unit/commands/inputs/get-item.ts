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

      test("should work with minimum set of fields", () => {
        expectWorks(
          {
            table: "toto",
            key: { pk: "word", sk: "pop" },
          },
          {
            TableName: "toto",
            Key: {
              pk: "word",
              sk: "pop",
            },
          },
        );
      });

      for (const value of CONSUMED_CAPACITY_RETURN_VALUES) {
        test(`should work with returnConsumedCapacity: ${value}`, () => {
          expectWorks(
            {
              table: "toto",
              key: { pk: "word", sk: "pop" },
              returnConsumedCapacity: value,
            },
            {
              TableName: "toto",
              Key: {
                pk: "word",
                sk: "pop",
              },
              ReturnConsumedCapacity: value,
            },
          );
        });
      }

      test("should work with projection", () => {
        expectWorks(
          {
            table: "toto",
            key: { pk: "word", sk: "pop" },
            projection: ["toto", path("tata.tutu"), literal("joe.cunt")],
          },
          {
            TableName: "toto",
            Key: {
              pk: "word",
              sk: "pop",
            },
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
            table: "toto",
            key: { pk: "word", sk: "pop" },
            projection: ["toto", "list[4]"],
            returnConsumedCapacity: "INDEXES",
          },
          {
            TableName: "toto",
            Key: {
              pk: "word",
              sk: "pop",
            },
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
