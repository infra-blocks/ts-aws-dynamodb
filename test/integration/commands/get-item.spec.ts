import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { expect } from "@infra-blocks/test";
import { DynamoDbClient, literal } from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDbClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe(DynamoDbClient.prototype.getItem.name, () => {
    it("should work as expected when item is present", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
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
    it("should return undefined for missing item", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      const result = await client.getItem({
        table,
        key: { pk: "User#BigToto" },
      });
      expect(result).to.be.empty;
    });
    it("should honor the project expression", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      const testClient = this.createTestClient();
      const item = {
        pk: "User#BigToto",
        whoCares: "notme",
        list: [1, 2, 3, 4],
        map: {
          outer: {
            inner: {
              included: true,
              excluded: true,
            },
            ignoreMe: 42,
          },
        },
        "fuck.top": "can-you-even?",
      };
      await testClient.send(
        new PutItemCommand({
          TableName: table,
          Item: marshall(item),
        }),
      );

      const result = await client.getItem({
        table,
        key: { pk: "User#BigToto" },
        projection: [
          "list[2]",
          "map.outer.inner.included",
          literal("fuck.top"),
        ],
      });
      expect(result).to.deep.equal({
        item: {
          list: [3],
          map: {
            outer: {
              inner: {
                included: true,
              },
            },
          },
          "fuck.top": "can-you-even?",
        },
      });
    });
  });
});
