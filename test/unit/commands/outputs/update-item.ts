import { suite, test } from "node:test";
import type { UpdateCommandOutput } from "@aws-sdk/lib-dynamodb";
import { expect } from "@infra-blocks/test";
import { trusted } from "@infra-blocks/types";
import { UpdateItemOutput } from "../../../../src/commands/outputs/index.js";

export const updateItemTests = () => {
  suite("UpdateItemOutput", () => {
    suite(UpdateItemOutput.decode.name, () => {
      const expectWorks = (
        output: UpdateCommandOutput,
        expected: UpdateItemOutput,
      ) => {
        expect(UpdateItemOutput.decode(output)).to.deep.equal(expected);
      };

      test("should work with minimal fields", () => {
        expectWorks(trusted({}), {});
      });

      test("should work with attributes", () => {
        expectWorks(trusted({ Attributes: { pk: "stfu", sk: "plz" } }), {
          attributes: { pk: "stfu", sk: "plz" },
        });
      });

      test("should work with consumed capacity", () => {
        expectWorks(
          trusted({
            ConsumedCapacity: { TableName: "test-table", CapacityUnits: 1 },
          }),
          {
            consumedCapacity: {
              tableName: "test-table",
              capacityUnits: 1,
            },
          },
        );
      });
    });
  });
};
