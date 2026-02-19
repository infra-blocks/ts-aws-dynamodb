import assert, { fail } from "node:assert";
import {
  ConditionalCheckFailedException,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-dynamodb";
import { findCauseByType } from "@infra-blocks/error";
import { expect, expectTypeOf } from "@infra-blocks/test";
import {
  type Attributes,
  attributeNotExists,
  type CreateTableInput,
} from "../../../src/index.js";
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
      const CreateTableInput: CreateTableInput = {
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
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
      const CreateTableInput: CreateTableInput = {
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
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
      const CreateTableInput: CreateTableInput = {
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
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
    it("should return the previous item when ALL_OLD requested", async function () {
      const client = this.createClient();
      const table = "test-table";
      const CreateTableInput: CreateTableInput = {
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
      const testClient = this.createTestClient();
      await testClient.send(
        new PutItemCommand({
          TableName: table,
          Item: { pk: { S: "User#BigToto" } },
        }),
      );

      const response = await client.deleteItem({
        table,
        key: { pk: "User#BigToto" },
        returnValues: "ALL_OLD",
      });
      expectTypeOf(response.item).toEqualTypeOf<Attributes | undefined>();
      expect(response.item).to.deep.equal({ pk: "User#BigToto" });

      const getItem = await testClient.send(
        new GetItemCommand({
          TableName: table,
          Key: { pk: { S: "User#BigToto" } },
        }),
      );
      expect(getItem.Item).to.be.undefined;
    });
    it("should return the previous item on condition check failure when ALL_OLD requested", async function () {
      const client = this.createClient();
      const table = "test-table";
      const CreateTableInput: CreateTableInput = {
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(CreateTableInput);
      const testClient = this.createTestClient();
      await testClient.send(
        new PutItemCommand({
          TableName: table,
          Item: { pk: { S: "User#BigToto" }, other: { S: "coucou" } },
        }),
      );

      try {
        await client.deleteItem({
          table,
          key: { pk: "User#BigToto" },
          returnValuesOnConditionCheckFailure: "ALL_OLD",
          condition: attributeNotExists("pk"),
        });
        fail("deleteItem should have thrown");
      } catch (err) {
        const cause = findCauseByType(err, ConditionalCheckFailedException);
        assert(cause != null);
        expect(cause.Item).to.deep.equal({
          pk: { S: "User#BigToto" },
          other: { S: "coucou" },
        });
      }
    });
  });
});
