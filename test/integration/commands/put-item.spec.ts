import { expect } from "@infra-blocks/test";
import {
  attribute,
  type CreateTableParams,
  DynamoDbClient,
  type PutItemParams,
  value,
  where,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDbClient.name, () => {
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

      const item = await client.getItem({
        table: createTableParams.name,
        partitionKey: { name: "pk", value: putItemParams.item.pk },
      });
      expect(item).to.deep.include(putItemParams.item);
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

      const item = await client.getItem({
        table: createTableParams.name,
        partitionKey: { name: "pk", value: putItemParams.item.pk },
        sortKey: { name: "sk", value: putItemParams.item.sk },
      });
      expect(item).to.deep.include(putItemParams.item);
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

      const item = await client.getItem({
        table: createTableParams.name,
        partitionKey: { name: "pk", value: putItemParams.item.pk },
        sortKey: { name: "sk", value: putItemParams.item.sk },
      });
      expect(item).to.deep.include(putItemParams.item);
    });
  });
});
