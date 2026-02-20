import { expect } from "@infra-blocks/test";
import {
  attributeNotExists,
  DynamoDbClient,
  set,
  value,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDbClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe(DynamoDbClient.prototype.writeTransaction.name, () => {
    it("should work with various actions", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      await client.putItem({ table, item: { pk: "UpdatedItem" } });
      await client.putItem({ table, item: { pk: "DeletedItem" } });
      const writeTransactionParams = {
        writes: [
          {
            put: {
              table,
              item: {
                pk: "NewItem",
              },
            },
          },
          {
            update: {
              table,
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
          {
            conditionCheck: {
              table,
              key: {
                pk: "InexistentItem",
              },
              condition: attributeNotExists("pk"),
            },
          },
        ],
      };
      await client.writeTransaction(writeTransactionParams);

      expect(
        await client.getItem({ table, key: { pk: "NewItem" } }),
      ).to.deep.equal({ item: { pk: "NewItem" } });
      expect(
        await client.getItem({ table, key: { pk: "UpdatedItem" } }),
      ).to.deep.equal({ item: { pk: "UpdatedItem", newField: 42 } });
      expect(await client.getItem({ table, key: { pk: "DeletedItem" } })).to.be
        .empty;
    });
  });
});
