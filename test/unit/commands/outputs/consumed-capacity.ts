import { suite, test } from "node:test";
import type * as sdk from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import { ConsumedCapacity } from "../../../../src/commands/outputs/consumed-capacity.js";

export const consumedCapacityTests = () => {
  suite("ConsumedCapacity", () => {
    const expectWorks = (
      output: sdk.ConsumedCapacity,
      expected: ConsumedCapacity,
    ) => {
      expect(ConsumedCapacity.decode(output)).to.deep.equal(expected);
    };

    test("should work with minimal fields set", () => {
      expectWorks(
        { TableName: "hello", CapacityUnits: 1.5 },
        { tableName: "hello", capacityUnits: 1.5 },
      );
    });

    test("should work with table field set", () => {
      expectWorks(
        {
          TableName: "hello",
          CapacityUnits: 1.5,
          Table: { CapacityUnits: 1.5 },
        },
        {
          tableName: "hello",
          capacityUnits: 1.5,
          table: { capacityUnits: 1.5 },
        },
      );
    });

    test("should work with gsi field set", () => {
      expectWorks(
        {
          TableName: "hello",
          CapacityUnits: 1.5,
          GlobalSecondaryIndexes: { "big-index": { CapacityUnits: 1.5 } },
        },
        {
          tableName: "hello",
          capacityUnits: 1.5,
          globalSecondaryIndexes: { "big-index": { capacityUnits: 1.5 } },
        },
      );
    });

    test("should work with lsi field set", () => {
      expectWorks(
        {
          TableName: "hello",
          CapacityUnits: 1.5,
          LocalSecondaryIndexes: { "big-index": { CapacityUnits: 1.5 } },
        },
        {
          tableName: "hello",
          capacityUnits: 1.5,
          localSecondaryIndexes: { "big-index": { capacityUnits: 1.5 } },
        },
      );
    });

    test("should work with all fields set", () => {
      expectWorks(
        {
          TableName: "hello",
          CapacityUnits: 4.5,
          ReadCapacityUnits: 1.5,
          WriteCapacityUnits: 3,
          GlobalSecondaryIndexes: {
            "global-index": {
              CapacityUnits: 1.5,
              ReadCapacityUnits: 0.5,
              WriteCapacityUnits: 1,
            },
          },
          LocalSecondaryIndexes: {
            "local-index": {
              CapacityUnits: 1.5,
              ReadCapacityUnits: 0.5,
              WriteCapacityUnits: 1,
            },
          },
          Table: {
            CapacityUnits: 1.5,
            ReadCapacityUnits: 0.5,
            WriteCapacityUnits: 1,
          },
        },
        {
          tableName: "hello",
          capacityUnits: 4.5,
          readCapacityUnits: 1.5,
          writeCapacityUnits: 3,
          globalSecondaryIndexes: {
            "global-index": {
              capacityUnits: 1.5,
              readCapacityUnits: 0.5,
              writeCapacityUnits: 1,
            },
          },
          localSecondaryIndexes: {
            "local-index": {
              capacityUnits: 1.5,
              readCapacityUnits: 0.5,
              writeCapacityUnits: 1,
            },
          },
          table: {
            capacityUnits: 1.5,
            readCapacityUnits: 0.5,
            writeCapacityUnits: 1,
          },
        },
      );
    });
  });
};
