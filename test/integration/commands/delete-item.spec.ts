import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import { findCauseByType } from "@infra-blocks/error";
import { expect } from "@infra-blocks/test";
import type { CreateTableParams } from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("deleteItem", () => {
    it("should fail if the table does not exist", async function () {
      const client = this.createClient();
      const promise = client.deleteItem({
        table: "non-existent",
        key: { pk: "User#BigToto" },
      });
      await expect(promise).to.be.rejected;
      promise.catch((err) => {
        expect(findCauseByType(err, ResourceNotFoundException)).to.not.be
          .undefined;
      });
    });
    it("should succeed when the item does not exist", async function () {
      const client = this.createClient();
      const table = "test-table";
      const createTableParams: CreateTableParams = {
        name: table,
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);
      await client.deleteItem({
        table,
        key: { pk: "User#BigToto" },
      });

      const testClient = this.createTestClient();
      const response = await testClient.send(
        new GetItemCommand({
          TableName: table,
          Key: { pk: { S: "User#BigToto" } },
        }),
      );
      expect(response.Item).to.be.undefined;
    });
    it("should succeed when the item exists", async function () {
      const client = this.createClient();
      const table = "test-table";
      const createTableParams: CreateTableParams = {
        name: table,
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);
      const testClient = this.createTestClient();
      await testClient.send(
        new PutItemCommand({
          TableName: table,
          Item: { pk: { S: "User#BigToto" } },
        }),
      );

      await client.deleteItem({
        table,
        key: { pk: "User#BigToto" },
      });

      const response = await testClient.send(
        new GetItemCommand({
          TableName: table,
          Key: { pk: { S: "User#BigToto" } },
        }),
      );
      expect(response.Item).to.be.undefined;
    });
    it("should work on compound table", async function () {
      const client = this.createClient();
      const table = "test-table";
      const createTableParams: CreateTableParams = {
        name: table,
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "S" },
        },
      };
      await client.createTable(createTableParams);
      const testClient = this.createTestClient();
      await testClient.send(
        new PutItemCommand({
          TableName: table,
          Item: { pk: { S: "User#BigToto" }, sk: { S: "Metadata" } },
        }),
      );

      await client.deleteItem({
        table,
        key: { pk: "User#BigToto", sk: "Metadata" },
      });

      const response = await testClient.send(
        new GetItemCommand({
          TableName: table,
          Key: { pk: { S: "User#BigToto" }, sk: { S: "Metadata" } },
        }),
      );
      expect(response.Item).to.be.undefined;
    });
  });
});
