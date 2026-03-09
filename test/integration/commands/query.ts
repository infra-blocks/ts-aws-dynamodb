import { suite, test } from "node:test";
import { asyncArrayCollect } from "@infra-blocks/iter";
import { expect } from "@infra-blocks/test";
import { and, contains, path, value } from "../../../src/index.js";
import type { TestKit } from "../kit.js";

export const queryTests = (kit: TestKit) => {
  suite("query", () => {
    kit.afterEach.dropTables();

    test("should work on empty table", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "email", type: "S" },
        },
      });

      const result = await client.query({
        table,
        keyCondition: [path("email"), "=", value("joe.cunt@gmail.com")],
      });
      expect(result).to.deep.equal({
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

      const result = await client.query({
        table,
        keyCondition: [path("email"), "=", value("joe.cunt@gmail.com")],
      });
      expect(result).to.deep.equal({
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

      const result = await client.query({
        table,
        keyCondition: ["pk", "=", value("Global")],
        limit: 1,
      });
      // Only the first lexicographical result is returned.
      expect(result).to.deep.equal({
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

      const result = await client.query({
        table,
        keyCondition: ["pk", "=", value("Global")],
        projection: ["pk", "list[0]", "map.inner.included"],
      });
      expect(result).to.deep.equal({
        items: [
          { pk: "Global", list: [1], map: { inner: { included: true } } },
        ],
        count: 1,
        scannedCount: 1,
      });
    });

    test("should correctly forward scanIndexForward parameter", async () => {
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

      const result = await client.query({
        table,
        keyCondition: ["pk", "=", value("Global")],
        scanIndexForward: false,
      });
      expect(result).to.deep.equal({
        // In reverse lexicographical order.
        items: [
          { pk: "Global", sk: "joe.cunt@gmail.com" },
          { pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" },
        ],
        count: 2,
        scannedCount: 2,
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

      const result = await client.query({
        table,
        keyCondition: ["pk", "=", value("Global")],
        filter: and(["includeMe", "=", true], contains("alias", value("Sexy"))),
      });
      expect(result).to.deep.equal({
        items: [filteredIn],
        count: 1,
        scannedCount: 2,
      });
    });
  });

  suite("paginateQuery", () => {
    kit.afterEach.dropTables();

    test("should work when results fit within one page", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: "test-table",
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

      const pages = await asyncArrayCollect(
        client.paginateQuery({
          table,
          keyCondition: ["pk", "=", value("Global")],
          limit: 20,
        }),
      );
      expect(pages).to.deep.equal([
        {
          items: [
            { pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" },
            { pk: "Global", sk: "joe.cunt@gmail.com" },
          ],
          count: 2,
          scannedCount: 2,
        },
      ]);
    });

    test("should work when results span multiple pages", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: "test-table",
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
      await client.putItem({
        table,
        item: { pk: "Global", sk: "joe.cunt+sexy.chocolate@gmail.com" },
      });

      const pages = await asyncArrayCollect(
        client.paginateQuery({
          table,
          keyCondition: ["pk", "=", value("Global")],
          limit: 1,
        }),
      );
      expect(pages).to.deep.equal([
        {
          items: [{ pk: "Global", sk: "joe.cunt+sexy.chocolate@gmail.com" }],
          count: 1,
          scannedCount: 1,
          lastEvaluatedKey: {
            pk: "Global",
            sk: "joe.cunt+sexy.chocolate@gmail.com",
          },
        },
        {
          items: [{ pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" }],
          count: 1,
          scannedCount: 1,
          lastEvaluatedKey: {
            pk: "Global",
            sk: "joe.cunt+sexy.times@gmail.com",
          },
        },
        {
          items: [{ pk: "Global", sk: "joe.cunt@gmail.com" }],
          count: 1,
          scannedCount: 1,
          lastEvaluatedKey: { pk: "Global", sk: "joe.cunt@gmail.com" },
        },
        {
          items: [],
          count: 0,
          scannedCount: 0,
        },
      ]);
    });
  });

  suite("iterateQuery", () => {
    kit.afterEach.dropTables();

    test("should work with results spanning multiple pages", async () => {
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
      await client.putItem({
        table,
        item: { pk: "Global", sk: "joe.cunt+sexy.chocolate@gmail.com" },
      });

      const pages = await asyncArrayCollect(
        client.iterateQuery({
          table,
          keyCondition: ["pk", "=", value("Global")],
          limit: 1,
        }),
      );
      expect(pages).to.deep.equal([
        {
          pk: "Global",
          sk: "joe.cunt+sexy.chocolate@gmail.com",
        },
        {
          pk: "Global",
          sk: "joe.cunt+sexy.times@gmail.com",
        },
        {
          pk: "Global",
          sk: "joe.cunt@gmail.com",
        },
      ]);
    });

    // TODO: test with indexes.
    test("should work with return consumed capacity set to 'TOTAL'", async () => {
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

      const result = await client.query({
        table,
        keyCondition: ["pk", "=", value("toto")],
        returnConsumedCapacity: "TOTAL",
      });
      expect(result).to.deep.equal({
        count: 1,
        items: [{ pk: "toto" }],
        scannedCount: 1,
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

      await client.putItem({
        table,
        item: {
          pk: "toto",
        },
      });

      const result = await client.query({
        table,
        keyCondition: ["pk", "=", value("toto")],
        returnConsumedCapacity: "INDEXES",
      });
      expect(result).to.deep.equal({
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
  });
};
