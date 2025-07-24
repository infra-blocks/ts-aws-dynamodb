import { expect } from "@infra-blocks/test";
import {
  type CreateTableParams,
  DynamoDbClient,
  type WriteTransactionParams,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDbClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("writeTransaction", () => {
    it("should work on table without sort key", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);
      const writeTransactionParams: WriteTransactionParams = {
        writes: [
          {
            table: createTableParams.name,
            item: {
              pk: "BigIron#1",
            },
          },
          {
            table: createTableParams.name,
            item: {
              pk: "BigIron#2",
            },
          },
        ],
      };
      await client.writeTransaction(writeTransactionParams);

      await Promise.all(
        writeTransactionParams.writes.map(async (transactItem) => {
          const item = await client.getItem({
            table: createTableParams.name,
            partitionKey: { name: "pk", value: transactItem.item.pk },
          });
          expect(item).to.deep.include(transactItem.item);
        }),
      );
    });
  });
});
