import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import type { CreateTableParams } from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("getItem", () => {
    it("should work on table without sort key", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);
      const testClient = this.createTestClient();
      await testClient.send(
        new PutItemCommand({
          TableName: createTableParams.name,
          Item: { pk: { S: "User#BigToto" } },
        }),
      );

      const item = await client.getItem({
        table: createTableParams.name,
        partitionKey: { name: "pk", value: "User#BigToto" },
      });
      expect(item).to.deep.include({
        pk: "User#BigToto",
      });
    });
    it("should work on table with sort key", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
      };
      await client.createTable(createTableParams);
      const testClient = this.createTestClient();
      await testClient.send(
        new PutItemCommand({
          TableName: createTableParams.name,
          Item: { pk: { S: "User#BigToto" }, sk: { N: "42" } },
        }),
      );

      const item = await client.getItem({
        table: createTableParams.name,
        partitionKey: { name: "pk", value: "User#BigToto" },
        sortKey: { name: "sk", value: 42 },
      });
      expect(item).to.deep.include({
        pk: "User#BigToto",
        sk: 42,
      });
    });
  });
});
