import test, { suite } from "node:test";
import {
  ConditionalCheckFailed,
  isTransactionCanceledBy,
} from "../../src/error.js";
import { attributeNotExists, type CreateTableInput } from "../../src/index.js";
import type { TestKit } from "./kit.js";

export const errorTests = (kit: TestKit) => {
  suite("error", () => {
    kit.afterEach.dropTables();

    suite(isTransactionCanceledBy.name, () => {
      suite("known reasons", () => {
        test("should work for ConditionalCheckFailed", async () => {
          const client = kit.createClient();
          const params: CreateTableInput = {
            name: "test-table",
            keySchema: {
              partitionKey: { name: "pk", type: "S" },
            },
          };
          await client.createTable(params);
          await client.putItem({
            table: "test-table",
            item: { pk: "key1" },
          });
          try {
            await client.writeTransaction({
              writes: [
                {
                  put: {
                    table: "test-table",
                    item: { pk: "key2" },
                    condition: attributeNotExists("pk"),
                  },
                },
                {
                  put: {
                    table: "test-table",
                    item: { pk: "key1" },
                    condition: attributeNotExists("pk"),
                  },
                },
              ],
            });
          } catch (err) {
            // Fail the test if the check does not work.
            if (
              !isTransactionCanceledBy(err, ConditionalCheckFailed.atIndex(1))
            ) {
              throw err;
            }
          }
        });
      });
    });
  });
};
