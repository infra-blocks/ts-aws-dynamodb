import test, { suite } from "node:test";
import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import type { TestKit } from "../kit.js";

export const deleteTableTests = (kit: TestKit) => {
  suite("deleteTable", () => {
    kit.afterEach.dropTables();

    test("should fail for non-existent table", async () => {
      const client = kit.createClient();
      const params = {
        name: "test-table",
      };
      await expect(client.deleteTable(params)).to.be.rejected;
    });
    test("should work with existing table", async () => {
      const client = kit.createClient();
      const params = {
        name: "test-table",
        keySchema: { partitionKey: { name: "pk", type: "S" } },
      } as const;
      await client.createTable(params);
      await client.deleteTable({ name: params.name });

      const testClient = kit.createSdkClient();
      const response = await testClient.send(new ListTablesCommand({}));
      expect(response.TableNames).to.be.empty;
    });
  });
};
