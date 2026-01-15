import { expect } from "@infra-blocks/test";
import {
  type CreateTableParams,
  DynamoDbClient,
  set,
  value,
  type WriteTransactionParams,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDbClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe(DynamoDbClient.prototype.writeTransaction.name, () => {
    it("should work with various actions", async function () {
      const client = this.createClient();
      const table = "test-table";
      const createTableParams: CreateTableParams = {
        name: table,
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);
      await client.putItem({ table, item: { pk: "UpdatedItem" } });
      await client.putItem({ table, item: { pk: "DeletedItem" } });
      const writeTransactionParams: WriteTransactionParams = {
        writes: [
          {
            put: {
              table: createTableParams.name,
              item: {
                pk: "NewItem",
              },
            },
          },
          {
            update: {
              table: createTableParams.name,
              key: {
                pk: "UpdatedItem",
              },
              update: [set("newField", value(42))],
            },
          },
          {
            delete: {
              table,
              key: {
                pk: "DeletedItem",
              },
            },
          },
        ],
      };
      await client.writeTransaction(writeTransactionParams);

      expect(
        await client.getItem({
          table: createTableParams.name,
          key: { pk: "NewItem" },
        }),
      ).to.deep.equal({ pk: "NewItem" });
      expect(
        await client.getItem({
          table: createTableParams.name,
          key: { pk: "UpdatedItem" },
        }),
      ).to.deep.equal({ pk: "UpdatedItem", newField: 42 });
      expect(
        await client.getItem({
          table: createTableParams.name,
          key: { pk: "DeletedItem" },
        }),
      ).to.be.undefined;
    });
  });
});
