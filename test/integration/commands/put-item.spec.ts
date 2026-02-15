import assert, { fail } from "node:assert";
import { findCauseByType } from "@infra-blocks/error";
import { expect, expectTypeOf } from "@infra-blocks/test";
import {
  type Attributes,
  attributeNotExists,
  attributeType,
  ConditionalCheckFailedException,
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
    it("should work on hash table", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);

      const putItemParams = {
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
        },
      };
      const response = await client.putItem(putItemParams);
      expect(response.item).to.be.undefined;

      const item = await client.getItem({
        table: createTableParams.name,
        key: { pk: putItemParams.item.pk },
      });
      expect(item).to.deep.include(putItemParams.item);
    });
    it("should work on compound table", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
      };
      await client.createTable(createTableParams);

      const putItemParams = {
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
          sk: 42,
        },
      };
      const response = await client.putItem(putItemParams);
      expect(response.item).to.be.undefined;

      const item = await client.getItem({
        table: createTableParams.name,
        key: { pk: putItemParams.item.pk, sk: putItemParams.item.sk },
      });
      expect(item).to.deep.include(putItemParams.item);
    });
    it("should behave the same when return values NONE is specified", async function () {
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
        returnValues: "NONE",
      };
      const response = await client.putItem(putItemParams);
      expect(response.item).to.be.undefined;
    });
    it("should return the previous item when ALL_OLD requested", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);

      const firstPut = {
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
          oldValue: "original",
        },
      };
      const firstResponse = await client.putItem(firstPut);
      expect(firstResponse.item).to.be.undefined;

      const secondPut = {
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
          newValue: "on the block",
        },
        returnValues: "ALL_OLD" as const,
      };
      const secondResponse = await client.putItem(secondPut);
      expectTypeOf(secondResponse.item).toEqualTypeOf<Attributes | undefined>();
      expect(secondResponse).to.deep.equal({
        item: {
          pk: "BigIron#1",
          oldValue: "original",
        },
      });

      // Sanity check to make sure the item was actually inserted.
      const item = await client.getItem({
        table: createTableParams.name,
        key: { pk: firstPut.item.pk },
      });
      expect(item).to.deep.include(secondPut.item);
    });
    it("should return the previous item on condition check failure when ALL_OLD requested", async function () {
      const client = this.createClient();
      const table = "test-table";
      const createTableParams: CreateTableParams = {
        name: table,
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);

      await client.putItem({
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
          oldValue: "original",
        },
      });

      try {
        await client.putItem({
          table,
          item: { pk: "BigIron#1", newValue: "allNew" },
          returnValuesOnConditionCheckFailure: "ALL_OLD",
          condition: attributeNotExists("pk"),
        });
        fail("putItem should have thrown");
      } catch (err) {
        const cause = findCauseByType(err, ConditionalCheckFailedException);
        assert(cause != null);
        expect(cause.Item).to.deep.equal({
          pk: { S: "BigIron#1" },
          oldValue: { S: "original" },
        });
      }
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
      const putItemParams = {
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
      const putItemParams = {
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
          string: "hello",
        },
      };
      // @ts-expect-error undefined is not a valid attribute field.
      await client.putItem({ ...putItemParams, undefined: undefined });

      const item = await client.getItem({
        table: createTableParams.name,
        key: { pk: putItemParams.item.pk },
      });
      // We're just double checking here that, even if the typing
      // does not allow to pass undefined, if a user works around it,
      // the field will still be stripped.
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
