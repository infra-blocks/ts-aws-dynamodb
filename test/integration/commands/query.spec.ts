import { asyncArrayCollect } from "@infra-blocks/iter";
import { expect } from "@infra-blocks/test";
import {
  type CreateTableInput,
  DynamoDbClient,
  path,
  value,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe("Query", () => {
  afterEach("clean up", dropAllTables());

  describe(DynamoDbClient.prototype.query.name, () => {
    it("should work on table without sort key", async function () {
      const client = this.createClient();
      const CreateTableInput: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "User#BigToto" },
      });

      const result = await client.query({
        table: CreateTableInput.name,
        condition: [path("pk"), "=", value("User#BigToto")],
      });
      expect(result).to.deep.equal({
        count: 1,
        scannedCount: 1,
        items: [
          {
            pk: "User#BigToto",
          },
        ],
        lastEvaluatedKey: undefined,
      });
    });
    // This is a regression test to enforce that "." in values are handled as expected.
    it("should work on table with email partition key", async function () {
      const client = this.createClient();
      const CreateTableInput: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "email", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
      await client.putItem({
        table: CreateTableInput.name,
        item: { email: "joe.cunt@gmail.com" },
      });

      const result = await client.query({
        table: CreateTableInput.name,
        condition: [path("email"), "=", value("joe.cunt@gmail.com")],
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
      const CreateTableInput: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt@gmail.com" },
      });
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" },
      });

      const result = await client.query({
        table: CreateTableInput.name,
        condition: ["pk", "=", value("Global")],
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
    it("should correctly forward scanIndexForward parameter", async function () {
      const client = this.createClient();
      const CreateTableInput: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt@gmail.com" },
      });
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" },
      });

      const result = await client.query({
        table: CreateTableInput.name,
        condition: ["pk", "=", value("Global")],
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
      const CreateTableInput: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt@gmail.com" },
      });
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" },
      });

      const pages = await asyncArrayCollect(
        client.paginateQuery({
          table: CreateTableInput.name,
          condition: ["pk", "=", value("Global")],
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
      const CreateTableInput: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt@gmail.com" },
      });
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" },
      });
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt+sexy.chocolate@gmail.com" },
      });

      const pages = await asyncArrayCollect(
        client.paginateQuery({
          table: CreateTableInput.name,
          condition: ["pk", "=", value("Global")],
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
      const CreateTableInput: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt@gmail.com" },
      });
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt+sexy.times@gmail.com" },
      });
      await client.putItem({
        table: CreateTableInput.name,
        item: { pk: "Global", sk: "joe.cunt+sexy.chocolate@gmail.com" },
      });

      const pages = await asyncArrayCollect(
        client.iterateQuery({
          table: CreateTableInput.name,
          condition: ["pk", "=", value("Global")],
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
