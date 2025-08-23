import { expect } from "@infra-blocks/test";
import {
  attributeNotExists,
  attributeType,
  type CreateTableParams,
  DynamoDbClient,
  or,
  type PutItemParams,
  path,
  value,
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
        key: { pk: putItemParams.item.pk },
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
        key: { pk: putItemParams.item.pk, sk: putItemParams.item.sk },
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
        condition: or(
          attributeType(path("sk"), value("N")),
          attributeNotExists(path("pk")),
        ),
      };
      await client.putItem(putItemParams);

      const item = await client.getItem({
        table: createTableParams.name,
        key: { pk: putItemParams.item.pk, sk: putItemParams.item.sk },
      });
      expect(item).to.deep.include(putItemParams.item);
    });
    it("should strip off undefined attributes", async function () {
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
          string: "hello",
          // We're just double checking here that, even if the typing
          // does not allow to pass undefined, if a user works around it,
          // the field will still be stripped.
          // @ts-expect-error undefined is not a valid attribute field.
          undefined: undefined,
        },
      };
      await client.putItem(putItemParams);

      const item = await client.getItem({
        table: createTableParams.name,
        key: { pk: putItemParams.item.pk },
      });
      expect(item).to.deep.equals({
        pk: "BigIron#1",
        string: "hello",
      });
    });
    it("should throw when passing undefined as part of a collection", async function () {
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
          // @ts-expect-error undefined is not a valid list element.
          invalid: [undefined],
        },
      };
      await expect(client.putItem(putItemParams)).to.eventually.be.rejected;
    });
  });
});
