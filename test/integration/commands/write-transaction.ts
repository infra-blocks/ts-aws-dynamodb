import test, { suite } from "node:test";
import { expect } from "@infra-blocks/test";
import { attributeNotExists, set, value } from "../../../src/index.js";
import type { TestKit } from "../kit.js";

export const writeTransactionTests = (kit: TestKit) => {
  suite("writeTransaction", () => {
    kit.afterEach.dropTables();

    test("should work with various actions", async () => {
      const client = kit.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      await client.putItem({ table, item: { pk: "UpdatedItem" } });
      await client.putItem({ table, item: { pk: "DeletedItem" } });
      await client.writeTransaction({
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
      });

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
};
