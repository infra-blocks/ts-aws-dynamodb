import { suite, test } from "node:test";
import type { DeleteCommandOutput } from "@aws-sdk/lib-dynamodb";
import { expect } from "@infra-blocks/test";
import { trusted } from "@infra-blocks/types";
import { DeleteItemOutput } from "../../../../src/commands/outputs/index.js";

export const deleteItemTests = () => {
  suite("deleteItem", () => {
    suite(DeleteItemOutput.decode.name, () => {
      const expectWorks = (
        output: DeleteCommandOutput,
        expected: DeleteItemOutput,
      ) => {
        expect(DeleteItemOutput.decode(output)).to.deep.equal(expected);
      };

      test("should work with minimal fields", () => {
        expectWorks(trusted({}), {});
      });

      test("should work with an item", () => {
        expectWorks(trusted({ Attributes: { pk: "stfu", sk: "plz" } }), {
          item: { pk: "stfu", sk: "plz" },
        });
      });

      test("should work with consumed capacity", () => {
        expectWorks(
          trusted({
            ConsumedCapacity: { TableName: "test-table", CapacityUnits: 0.5 },
          }),
          {
            consumedCapacity: {
              tableName: "test-table",
              capacityUnits: 0.5,
            },
          },
        );
      });
    });
  });
};
