import { suite, test } from "node:test";
import type { TransactWriteItemsCommandOutput } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import { trusted } from "@infra-blocks/types";
import { WriteTransactionOutput } from "../../../../src/commands/outputs/index.js";

export const writeTransactionTests = () => {
  suite("WriteTransactionOutput", () => {
    suite(WriteTransactionOutput.decode.name, () => {
      const expectWorks = (
        output: TransactWriteItemsCommandOutput,
        expected: WriteTransactionOutput,
      ) => {
        expect(WriteTransactionOutput.decode(output)).to.deep.equal(expected);
      };

      test("should work with minimal fields", () => {
        expectWorks(trusted({}), {});
      });

      test("should work with consumed capacity", () => {
        expectWorks(
          trusted({
            ConsumedCapacity: [{ TableName: "test-table", CapacityUnits: 1 }],
          }),
          {
            consumedCapacity: [
              {
                tableName: "test-table",
                capacityUnits: 1,
              },
            ],
          },
        );
      });
    });
  });
};
