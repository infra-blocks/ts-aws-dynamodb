import {
  ConditionalCheckFailed,
  isTransactionCanceledBy,
} from "../../src/error.js";
import { attributeNotExists, type CreateTableInput } from "../../src/index.js";
import { dropAllTables } from "./fixtures.js";

describe("error", () => {
  afterEach("clean up", dropAllTables());

  describe(isTransactionCanceledBy.name, () => {
    describe("known reasons", () => {
      it("should work for ConditionalCheckFailed", async function () {
        const client = this.createClient();
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
