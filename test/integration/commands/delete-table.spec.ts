import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import type {
  CreateTableParams,
  DeleteTableParams,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("deleteTable", () => {
    it("should fail for non-existent table", async function () {
      const client = this.createClient();
      const params: DeleteTableParams = {
        name: "test-table",
      };
      await expect(client.deleteTable(params)).to.be.rejected;
    });
    it("should work with existing table", async function () {
      const client = this.createClient();
      const params: CreateTableParams = {
        name: "test-table",
        primaryKey: { partitionKey: { name: "pk", type: "S" } },
      };
      await client.createTable(params);
      await client.deleteTable({ name: params.name });

      const testClient = this.createTestClient();
      const response = await testClient.send(new ListTablesCommand({}));
      expect(response.TableNames).to.be.empty;
    });
  });
});
