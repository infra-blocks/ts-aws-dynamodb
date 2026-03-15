import test, { suite } from "node:test";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { expect } from "@infra-blocks/test";
import { literal } from "../../../src/index.js";
import type { TestKit } from "../kit.js";

export const getItemTests = (kit: TestKit) => {
  suite("getItem", () => {
    kit.afterEach.dropTables();

    test("should work as expected when item is present", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
      });
      const testClient = kit.createSdkClient();
      await testClient.send(
        new PutItemCommand({
          TableName: table,
          Item: { pk: { S: "User#BigToto" }, sk: { N: "42" } },
        }),
      );

      const item = await client.getItem({
        table,
        key: { pk: "User#BigToto", sk: 42 },
      });
      expect(item).to.deep.include({
        item: {
          pk: "User#BigToto",
          sk: 42,
        },
      });
    });

    test("should return undefined for missing item", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      const result = await client.getItem({
        table,
        key: { pk: "User#BigToto" },
      });
      expect(result).to.be.empty;
    });

    test("should honor the project expression", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      const testClient = kit.createSdkClient();
      const item = {
        pk: "User#BigToto",
        whoCares: "notme",
        list: [1, 2, 3, 4],
        map: {
          outer: {
            inner: {
              included: true,
              excluded: true,
            },
            ignoreMe: 42,
          },
        },
        "fuck.top": "can-you-even?",
      };
      await testClient.send(
        new PutItemCommand({
          TableName: table,
          Item: marshall(item),
        }),
      );

      const result = await client.getItem({
        table,
        key: { pk: "User#BigToto" },
        projection: [
          "list[2]",
          "map.outer.inner.included",
          literal("fuck.top"),
        ],
      });
      expect(result).to.deep.equal({
        item: {
          list: [3],
          map: {
            outer: {
              inner: {
                included: true,
              },
            },
          },
          "fuck.top": "can-you-even?",
        },
      });
    });

    test("should work with return consumed capacity set to 'TOTAL'", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });

      // Since we're only checking for consumed capacity, we don't really care about the
      // presence of an item.
      const result = await client.getItem({
        table,
        key: { pk: "User#BigToto" },
        returnConsumedCapacity: "TOTAL",
      });
      expect(result).to.deep.equal({
        consumedCapacity: {
          tableName: "test-table",
          capacityUnits: 0.5,
        },
      });
    });

    test("should work with return consumed capacity set to 'INDEXES'", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });

      // Since we're only checking for consumed capacity, we don't really care about the
      // presence of an item.
      const result = await client.getItem({
        table,
        key: { pk: "User#BigToto" },
        returnConsumedCapacity: "INDEXES",
      });
      expect(result).to.deep.equal({
        consumedCapacity: {
          tableName: "test-table",
          capacityUnits: 0.5,
          table: {
            capacityUnits: 0.5,
          },
        },
      });
    });

    test("should work with consistent read set to true", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });

      // Since we're only checking for consumed capacity, we don't really care about the
      // presence of an item.
      const result = await client.getItem({
        table,
        key: { pk: "User#BigToto" },
        consistentRead: true,
        returnConsumedCapacity: "TOTAL", // Using the consumed capacity here to assess if it was consistent or not.
      });
      expect(result).to.deep.equal({
        consumedCapacity: {
          tableName: "test-table",
          capacityUnits: 1, // Consistent reads are double the capacity units.
        },
      });
    });
  });
};
