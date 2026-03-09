import { suite, test } from "node:test";
import type { QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { expect } from "@infra-blocks/test";
import { trusted } from "@infra-blocks/types";
import { QueryOutput } from "../../../../src/commands/outputs/index.js";

export const queryTests = () => {
  suite("QueryOutput", () => {
    suite(QueryOutput.decode.name, () => {
      const expectWorks = (
        output: QueryCommandOutput,
        expected: QueryOutput,
      ) => {
        expect(QueryOutput.decode(output)).to.deep.equal(expected);
      };

      const minimalOutput: QueryCommandOutput = trusted({
        Count: 1,
        ScannedCount: 2,
      });
      const minimalExpected: QueryOutput = {
        count: 1,
        items: [],
        scannedCount: 2,
      };

      test("should work with minimal fields", () => {
        expectWorks(minimalOutput, minimalExpected);
      });

      test("should work with items", () => {
        expectWorks(
          {
            ...minimalOutput,
            Items: [{ pk: "toto" }, { pk: "tata" }],
          },
          {
            ...minimalExpected,
            items: [{ pk: "toto" }, { pk: "tata" }],
          },
        );
      });

      test("should work with last evaluated key", () => {
        expectWorks(
          {
            ...minimalOutput,
            LastEvaluatedKey: {
              pk: "stfu",
            },
          },
          {
            ...minimalExpected,
            lastEvaluatedKey: { pk: "stfu" },
          },
        );
      });

      test("should work with consumed capacity", () => {
        expectWorks(
          {
            ...minimalOutput,
            ConsumedCapacity: { TableName: "test-table", CapacityUnits: 0.5 },
          },
          {
            ...minimalExpected,
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
