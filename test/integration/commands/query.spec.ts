import { asyncArrayCollect } from "@infra-blocks/iter";
import { expect } from "@infra-blocks/test";
import { DynamoDbClient, path, value } from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe("Query", () => {
  afterEach("clean up", dropAllTables());

  describe(DynamoDbClient.prototype.query.name, () => {
    it("should work on empty table", async function () {
      const client = this.createClient();
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
        lastEvaluatedKey: undefined,
      });
    });
    it("should work on table with one item", async function () {
      const client = this.createClient();
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
        lastEvaluatedKey: undefined,
      });
    });
    it("should correctly forward limit parameter", async function () {
      const client = this.createClient();
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
    it("should correctly forward projection parameter", async function () {
      const client = this.createClient();
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
        lastEvaluatedKey: undefined,
      });
    });
    it("should correctly forward scanIndexForward parameter", async function () {
      const client = this.createClient();
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
        lastEvaluatedKey: undefined,
      });
    });
  });
  describe(DynamoDbClient.prototype.paginateQuery.name, () => {
    it("should work when results fit within one page", async function () {
      const client = this.createClient();
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
          lastEvaluatedKey: undefined,
        },
      ]);
    });
    it("should work when results span multiple pages", async function () {
      const client = this.createClient();
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
          lastEvaluatedKey: undefined,
        },
      ]);
    });
  });
  describe(DynamoDbClient.prototype.iterateQuery.name, () => {
    it("should work with results spanning multiple pages", async function () {
      const client = this.createClient();
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
  });
});
