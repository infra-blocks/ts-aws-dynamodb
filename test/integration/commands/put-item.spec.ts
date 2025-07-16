import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import {
  attribute,
  type CreateTableParams,
  type PutItemParams,
  value,
  where,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("putItem", () => {
    it("should work on table without sort key", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);
      const putItemParams: PutItemParams = {
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
        },
      };
      await client.putItem(putItemParams);

      const testClient = this.createTestClient();
      const response = await testClient.send(
        new GetItemCommand({
          TableName: createTableParams.name,
          Key: { pk: { S: putItemParams.item.pk } },
        }),
      );
      expect(response.Item).to.deep.include({
        pk: { S: putItemParams.item.pk },
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
      const putItemParams: PutItemParams = {
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
          sk: 42,
        },
      };
      await client.putItem(putItemParams);

      const testClient = this.createTestClient();
      const response = await testClient.send(
        new GetItemCommand({
          TableName: createTableParams.name,
          Key: {
            pk: { S: putItemParams.item.pk },
            sk: { N: String(putItemParams.item.sk) },
          },
        }),
      );
      expect(response.Item).to.deep.include({
        pk: { S: putItemParams.item.pk },
        sk: { N: String(putItemParams.item.sk) },
      });
    });
    it("should work with expression", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
      };
      await client.createTable(createTableParams);
      const putItemParams: PutItemParams = {
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
          sk: 42,
        },
        condition: where(attribute("sk"))
          .isType(value("N"))
          .or(where(attribute("pk")).notExists()),
      };
      await client.putItem(putItemParams);

      const testClient = this.createTestClient();
      const response = await testClient.send(
        new GetItemCommand({
          TableName: createTableParams.name,
          Key: {
            pk: { S: putItemParams.item.pk },
            sk: { N: String(putItemParams.item.sk) },
          },
        }),
      );
      expect(response.Item).to.deep.include({
        pk: { S: putItemParams.item.pk },
        sk: { N: String(putItemParams.item.sk) },
      });
    });
  });
});
