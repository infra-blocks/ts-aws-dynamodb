import { suite, test } from "node:test";
import type { UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { expect } from "@infra-blocks/test";
import {
  UPDATE_ITEM_RETURN_VALUES,
  UpdateItemInput,
} from "../../../../src/commands/inputs/index.js";
import {
  CONDITION_CHECK_FAILURE_RETURN_VALUES,
  CONSUMED_CAPACITY_RETURN_VALUES,
} from "../../../../src/commands/inputs/lib.js";
import { attributeExists, set, value } from "../../../../src/index.js";

export const updateItemTests = () => {
  suite("UpdateItemInput", () => {
    suite(UpdateItemInput.encode.name, () => {
      const expectWorks = (
        input: UpdateItemInput,
        expected: UpdateCommandInput,
      ) => {
        expect(UpdateItemInput.encode(input)).to.deep.equal(expected);
      };

      const minimalInput = {
        table: "toto",
        key: { pk: "word", sk: "pop" },
        update: [set("pk", value("toto"))],
      };
      const minimalExpected = {
        TableName: "toto",
        Key: {
          pk: "word",
          sk: "pop",
        },
        UpdateExpression: "SET #attr1 = :value1",
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

      test("should work with condition", () => {
        expectWorks(
          {
            ...minimalInput,
            condition: attributeExists("pk"),
          },
          {
            ...minimalExpected,
            ConditionExpression: "attribute_exists(#attr1)",
          },
        );
      });

      for (const v of CONSUMED_CAPACITY_RETURN_VALUES) {
        test(`should work with returnConsumedCapacity set to '${v}'`, () => {
          expectWorks(
            { ...minimalInput, returnConsumedCapacity: v },
            { ...minimalExpected, ReturnConsumedCapacity: v },
          );
        });
      }

      for (const v of UPDATE_ITEM_RETURN_VALUES) {
        test(`should work with return values set to '${v}'`, () => {
          expectWorks(
            {
              ...minimalInput,
              returnValues: v,
            },
            {
              ...minimalExpected,
              ReturnValues: v,
            },
          );
        });
      }

      for (const v of CONDITION_CHECK_FAILURE_RETURN_VALUES) {
        test(`should work with returnValuesOnConditionCheckFailure set to '${v}'`, () => {
          expectWorks(
            {
              ...minimalInput,
              returnValuesOnConditionCheckFailure: v,
            },
            {
              ...minimalExpected,
              ReturnValuesOnConditionCheckFailure: v,
            },
          );
        });
      }
    });
  });
};
