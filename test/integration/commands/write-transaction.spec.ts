import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import type {
  CreateTableParams,
  WriteTransactionParams,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
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

      const testClient = this.createTestClient();
      await Promise.all(
        writeTransactionParams.writes.map(async (transactItem) => {
          const response = await testClient.send(
            new GetItemCommand({
              TableName: createTableParams.name,
              Key: { pk: { S: transactItem.item.pk } },
            }),
          );
          expect(response.Item).to.deep.include({
            pk: { S: transactItem.item.pk },
          });
        }),
      );
    });
  });
});
