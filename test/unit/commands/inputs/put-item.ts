import { suite, test } from "node:test";
import type { PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { expect, expectTypeOf } from "@infra-blocks/test";
import { PutItemInput } from "../../../../src/commands/inputs/index.js";
import {
  CONDITION_CHECK_FAILURE_RETURN_VALUES,
  CONSUMED_CAPACITY_RETURN_VALUES,
} from "../../../../src/commands/inputs/lib.js";
import { value } from "../../../../src/index.js";

export const putItemTests = () => {
  suite("PutItemInput", () => {
    suite(PutItemInput.encode.name, () => {
      const expectWorks = (input: PutItemInput, expected: PutCommandInput) => {
        expect(PutItemInput.encode(input)).to.deep.equal(expected);
      };

      test("should work with minimum set of fields", () => {
        expectWorks(
          {
            table: "toto",
            item: { pk: "word", sk: "pop" },
          },
          {
            TableName: "toto",
            Item: {
              pk: "word",
              sk: "pop",
            },
          },
        );
      });

      test("should work with condition", () => {
        expectWorks(
          {
            table: "toto",
            item: { pk: "word", sk: "pop" },
            condition: ["toto", "=", value("tata")],
          },
          {
            TableName: "toto",
            Item: {
              pk: "word",
              sk: "pop",
            },
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
              table: "toto",
              item: { pk: "word", sk: "pop" },
              returnConsumedCapacity: v,
            },
            {
              TableName: "toto",
              Item: {
                pk: "word",
                sk: "pop",
              },
              ReturnConsumedCapacity: v,
            },
          );
        });
      }

      for (const v of ["NONE", "ALL_OLD"] as const) {
        test(`should work with return values set to '${v}'`, () => {
          expectWorks(
            {
              table: "toto",
              item: { pk: "word", sk: "pop" },
              returnValues: v,
            },
            {
              TableName: "toto",
              Item: {
                pk: "word",
                sk: "pop",
              },
              ReturnValues: v,
            },
          );
        });
      }

      test("should not compile with a return value set to 'UPDATED_OLD'", () => {
        expectTypeOf<"UPDATED_OLD">().not.toExtend<
          PutItemInput["returnValues"]
        >();
      });

      test("should not compile with a return value set to 'ALL_NEW'", () => {
        expectTypeOf<"ALL_NEW">().not.toExtend<PutItemInput["returnValues"]>();
      });

      test("should not compile with a return value set to 'UPDATED_NEW'", () => {
        expectTypeOf<"UPDATED_NEW">().not.toExtend<
          PutItemInput["returnValues"]
        >();
      });

      for (const v of CONDITION_CHECK_FAILURE_RETURN_VALUES) {
        test(`should work with returnValuesOnConditionCheckFailure set to '${v}'`, () => {
          expectWorks(
            {
              table: "toto",
              item: { pk: "word", sk: "pop" },
              returnValuesOnConditionCheckFailure: v,
            },
            {
              TableName: "toto",
              Item: {
                pk: "word",
                sk: "pop",
              },
              ReturnValuesOnConditionCheckFailure: v,
            },
          );
        });
      }
    });
  });
};
