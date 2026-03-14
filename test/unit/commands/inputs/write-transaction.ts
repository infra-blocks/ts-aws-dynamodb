import { suite, test } from "node:test";
import type { TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { expect } from "@infra-blocks/test";
import {
  ConditionCheckInput,
  DeleteItemInput,
  PutItemInput,
  UpdateItemInput,
  WriteTransactionInput,
} from "../../../../src/commands/inputs/index.js";
import {
  CONSUMED_CAPACITY_RETURN_VALUES,
  ITEM_COLLECTION_METRICS_RETURN_VALUES,
} from "../../../../src/commands/inputs/lib.js";
import { attributeExists, set, value } from "../../../../src/index.js";

export const writeTransactionTests = () => {
  suite("WriteTransactionInput", () => {
    suite(WriteTransactionInput.encode.name, () => {
      const expectWorks = (
        input: WriteTransactionInput,
        expected: TransactWriteCommandInput,
      ) => {
        expect(WriteTransactionInput.encode(input)).to.deep.equal(expected);
      };

      const minimalInput: WriteTransactionInput = {
        writes: [],
      };
      const minimalExpected: TransactWriteCommandInput = {
        TransactItems: [],
      };

      test("should work with minimum set of fields", () => {
        expectWorks(minimalInput, minimalExpected);
      });

      test("should work with a put", () => {
        const put: PutItemInput = { table: "toto", item: { pk: "stfu" } };
        expectWorks(
          { writes: [{ put }] },
          { TransactItems: [{ Put: PutItemInput.encode(put) }] },
        );
      });

      test("should work with a delete", () => {
        const input: DeleteItemInput = {
          table: "tutu",
          key: { pk: "really", sk: "stfu-this-time" },
        };
        expectWorks(
          { writes: [{ delete: input }] },
          { TransactItems: [{ Delete: DeleteItemInput.encode(input) }] },
        );
      });

      test("should work with an update", () => {
        const update: UpdateItemInput = {
          table: "big-table",
          key: { pk: "yeah-ok" },
          update: [set("price", value("a of blangs"))],
        };
        expectWorks(
          { writes: [{ update }] },
          { TransactItems: [{ Update: UpdateItemInput.encode(update) }] },
        );
      });

      test("should work with a condition check", () => {
        const conditionCheck: ConditionCheckInput = {
          table: "where",
          key: { pk: "is it here?" },
          condition: attributeExists("I don't know"),
        };
        expectWorks(
          { writes: [{ conditionCheck }] },
          {
            TransactItems: [
              { ConditionCheck: ConditionCheckInput.encode(conditionCheck) },
            ],
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
    });
  });
};
