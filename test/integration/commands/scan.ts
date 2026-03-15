import { suite, test } from "node:test";
import { assert } from "@infra-blocks/test";
import { and, contains, value } from "../../../src/index.js";
import type { TestKit } from "../kit.js";

export const scanTests = (kit: TestKit) => {
  suite("scan", () => {
    kit.afterEach.dropTables();

    // We're only testing those because the API allows to make that mistake.
    test("should fail when only segment is provided", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "email", type: "S" },
        },
      });

      await assert.rejects(client.scan({ table, segment: 0 }));
    });

    test("should fail when only totalSegments is provided", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "email", type: "S" },
        },
      });

      await assert.rejects(client.scan({ table, totalSegments: 0 }));
    });

    test("should work on empty table", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "email", type: "S" },
        },
      });

      const result = await client.scan({ table });
      assert.deepEqual(result, {
        count: 0,
        scannedCount: 0,
        items: [],
      });
    });

    test("should work on table with one item", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "email", type: "S" },
        },
      });
      await client.putItem({ table, item: { email: "joe.cunt@gmail.com" } });

      const result = await client.scan({
        table,
      });
      assert.deepEqual(result, {
        count: 1,
        scannedCount: 1,
        items: [
          {
            email: "joe.cunt@gmail.com",
          },
        ],
      });
    });

    test("should correctly forward limit parameter", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "S" },
        },
      });
      await client.putItem({
        table,
        item: { pk: "Global", sk: "joe.cunt@gmail.com" },
      });
      await client.putItem({
        table,
        item: { pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" },
      });

      const result = await client.scan({
        table,
        limit: 1,
      });
      // Only the first lexicographical result is returned, thanks for the sort key.
      assert.deepEqual(result, {
        items: [{ pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" }],
        count: 1,
        scannedCount: 1,
        lastEvaluatedKey: {
          pk: "Global",
          sk: "joe.cunt+sexy.times@gmail.com",
        },
      });
    });

    test("should correctly forward projection parameter", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      await client.putItem({
        table,
        item: {
          pk: "Global",
          list: [1, 2, 3, 4],
          map: { inner: { included: true, excluded: true } },
          ignoreMe: "please",
        },
      });

      const result = await client.scan({
        table,
        projection: ["pk", "list[0]", "map.inner.included"],
      });
      assert.deepEqual(result, {
        items: [
          { pk: "Global", list: [1], map: { inner: { included: true } } },
        ],
        count: 1,
        scannedCount: 1,
      });
    });

    test("should correctly forward filter parameter", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "S" },
        },
      });
      await client.putItem({
        table,
        item: {
          pk: "Global",
          sk: "joe.cunt@gmail.com",
          alias: "The Big Cunt",
          includeMe: true,
        },
      });
      const filteredIn = {
        pk: "Global",
        sk: "joe.cunt+sexy.times@gmail.com",
        alias: "Sexy Times",
        includeMe: true,
      };
      await client.putItem({
        table,
        item: filteredIn,
      });

      const result = await client.scan({
        table,
        filter: and(["includeMe", "=", true], contains("alias", value("Sexy"))),
      });
      assert.deepEqual(result, {
        items: [filteredIn],
        count: 1,
        scannedCount: 2,
      });
    });

    test("should work with returnConsumedCapacity set to 'TOTAL'", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });

      // Just putting an item so that the returned capacity isn't 0.
      await client.putItem({
        table,
        item: {
          pk: "toto",
        },
      });

      const result = await client.scan({
        table,
        returnConsumedCapacity: "TOTAL",
      });
      assert.deepEqual(result, {
        count: 1,
        items: [{ pk: "toto" }],
        scannedCount: 1,
        consumedCapacity: {
          tableName: "test-table",
          capacityUnits: 0.5,
        },
      });
    });

    test("should work with returnConsumedCapacity set to 'INDEXES'", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });

      await client.putItem({
        table,
        item: {
          pk: "toto",
        },
      });

      const result = await client.scan({
        table,
        returnConsumedCapacity: "INDEXES",
      });
      assert.deepEqual(result, {
        count: 1,
        items: [{ pk: "toto" }],
        scannedCount: 1,
        consumedCapacity: {
          tableName: "test-table",
          capacityUnits: 0.5,
          table: {
            capacityUnits: 0.5,
          },
        },
      });
    });

    test("should correctly forward the segmentation parameters", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "email", type: "S" },
        },
      });
      await client.putItem({ table, item: { email: "joe.cunt@gmail.com" } });

      const result = await client.scan({
        table,
        segment: 0,
        totalSegments: 1,
      });
      assert.deepEqual(result, {
        count: 1,
        scannedCount: 1,
        items: [
          {
            email: "joe.cunt@gmail.com",
          },
        ],
      });
    });
  });
};
