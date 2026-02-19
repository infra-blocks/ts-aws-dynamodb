import assert, { fail } from "node:assert";
import { findCauseByType } from "@infra-blocks/error";
import { expect, expectTypeOf } from "@infra-blocks/test";
import {
  attributeNotExists,
  attributeType,
  ConditionalCheckFailedException,
  DynamoDbClient,
  or,
  path,
  value,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDbClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("putItem", () => {
    it("should work on hash table", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });

      const item = { pk: "BigIron#1" };
      const response = await client.putItem({ table, item });
      expect(response.item).to.be.undefined;

      const result = await client.getItem({ table, key: { pk: item.pk } });
      expect(result).to.deep.include({ item });
    });
    it("should work on compound table", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
      });

      const item = { pk: "BigIron#1", sk: 42 };
      const response = await client.putItem({ table, item });
      expect(response.item).to.be.undefined;

      const result = await client.getItem({ table, key: item });
      expect(result).to.deep.include({ item });
    });
    it("should behave the same when return values NONE is specified", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });

      const item = { pk: "BigIron#1" };
      const response = await client.putItem({
        table,
        item,
        returnValues: "NONE",
      });
      expect(response.item).to.be.undefined;
    });
    it("should return the previous item when ALL_OLD requested", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });

      const firstItem = { pk: "BigIron#1", oldValue: "original" };
      const firstResponse = await client.putItem({
        table,
        item: firstItem,
        returnValues: "ALL_OLD",
      });
      expect(firstResponse.item).to.be.undefined;

      const secondItem = { pk: "BigIron#1", newValue: "on the block" };
      const secondResponse = await client.putItem({
        table,
        item: secondItem,
        returnValues: "ALL_OLD",
      });
      expectTypeOf(secondResponse.item).toEqualTypeOf<
        typeof secondItem | undefined
      >();
      expect(secondResponse).to.deep.include({ item: firstItem });

      // Sanity check to make sure the item was actually inserted.
      const result = await client.getItem({ table, key: { pk: firstItem.pk } });
      expect(result).to.deep.include({ item: secondItem });
    });
    it("should return the previous item on condition check failure when ALL_OLD requested", async function () {
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
        // TODO: use document client unmarshall/marshall functions for these types of translations.
        expect(cause.Item).to.deep.equal({
          pk: { S: "BigIron#1" },
          oldValue: { S: "original" },
        });
      }
    });
    it("should work with expression", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
      });
      const item = { pk: "BigIron#1", sk: 42 };
      await client.putItem({
        table,
        item,
        condition: or(
          attributeType(path("sk"), value("N")),
          attributeNotExists(path("pk")),
        ),
      });

      const result = await client.getItem({ table, key: item });
      expect(result).to.deep.include({ item });
    });
    it("should strip off undefined attributes", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });

      const item = { pk: "BigIron#1", string: "hello" };
      // @ts-expect-error undefined is not a valid attribute field.
      await client.putItem({ table, item, undefined: undefined });

      const result = await client.getItem({
        table,
        key: { pk: item.pk },
      });
      // We're just double checking here that, even if the typing
      // does not allow to pass undefined, if a user works around it,
      // the field will still be stripped.
      expect(result).to.deep.include({ item });
    });
    it("should throw when passing undefined as part of a collection", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      const putItemParams = {
        table,
        item: {
          pk: "BigIron#1",
          invalid: [undefined],
        },
      } as const;
      // @ts-expect-error undefined is not a valid list element.
      await expect(client.putItem(putItemParams)).to.eventually.be.rejected;
    });
  });
});
