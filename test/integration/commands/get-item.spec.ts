import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import { DynamoDbClient } from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDbClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe(DynamoDbClient.prototype.getItem.name, () => {
    it("should work on table without sort key", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      const testClient = this.createTestClient();
      await testClient.send(
        new PutItemCommand({
          TableName: table,
          Item: { pk: { S: "User#BigToto" } },
        }),
      );

      const item = await client.getItem({
        table,
        key: { pk: "User#BigToto" },
      });
      expect(item).to.deep.include({
        item: { pk: "User#BigToto" },
      });
    });
    it("should work on table with sort key", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
      });
      const testClient = this.createTestClient();
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
  });
});
