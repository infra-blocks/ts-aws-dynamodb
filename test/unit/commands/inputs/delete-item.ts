import { suite, test } from "node:test";
import type { DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { expect, expectTypeOf } from "@infra-blocks/test";
import { DeleteItemInput } from "../../../../src/commands/inputs/index.js";
import {
  CONDITION_CHECK_FAILURE_RETURN_VALUES,
  CONSUMED_CAPACITY_RETURN_VALUES,
  ITEM_COLLECTION_METRICS_RETURN_VALUES,
} from "../../../../src/commands/inputs/lib.js";
import { value } from "../../../../src/index.js";

export const deleteItemTests = () => {
  suite("DeleteItemInput", () => {
    suite(DeleteItemInput.encode.name, () => {
      const expectWorks = (
        input: DeleteItemInput,
        expected: DeleteCommandInput,
      ) => {
        expect(DeleteItemInput.encode(input)).to.deep.equal(expected);
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

      test("should work with condition", () => {
        expectWorks(
          {
            ...minimalInput,
            condition: ["toto", "=", value("tata")],
          },
          {
            ...minimalExpected,
            ConditionExpression: "#attr1 = :value1",
            ExpressionAttributeNames: {
              "#attr1": "toto",
            },
            ExpressionAttributeValues: {
              ":value1": "tata",
            },
          },
        );
      });

      for (const v of CONSUMED_CAPACITY_RETURN_VALUES) {
        test(`should work with returnConsumedCapacity set to '${v}'`, () => {
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

      for (const v of ITEM_COLLECTION_METRICS_RETURN_VALUES) {
        test(`should work with returnItemCollectionMetrics set to '${v}'`, () => {
          expectWorks(
            {
              ...minimalInput,
              returnItemCollectionMetrics: v,
            },
            {
              ...minimalExpected,
              ReturnItemCollectionMetrics: v,
            },
          );
        });
      }

      for (const v of ["NONE", "ALL_OLD"] as const) {
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

      test("should not compile with a return value set to 'UPDATED_OLD'", () => {
        expectTypeOf<"UPDATED_OLD">().not.toExtend<
          DeleteItemInput["returnValues"]
        >();
      });

      test("should not compile with a return value set to 'ALL_NEW'", () => {
        expectTypeOf<"ALL_NEW">().not.toExtend<
          DeleteItemInput["returnValues"]
        >();
      });

      test("should not compile with a return value set to 'UPDATED_NEW'", () => {
        expectTypeOf<"UPDATED_NEW">().not.toExtend<
          DeleteItemInput["returnValues"]
        >();
      });

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
