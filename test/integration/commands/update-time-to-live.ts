import { suite, test } from "node:test";
import { DescribeTimeToLiveCommand } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import type { TestKit } from "../kit.js";

export const updateTimeToLiveTests = (kit: TestKit) => {
  suite("updateTimeToLive", () => {
    kit.afterEach.dropTables();

    test("should correctly enable it", async () => {
      const client = kit.createClient();
      const CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      } as const;
      await client.createTable(CreateTableInput);
      await client.updateTimeToLive({
        table: CreateTableInput.name,
        attribute: "ttl",
        enabled: true,
      });
      const testClient = kit.createSdkClient();
      const response = await testClient.send(
        new DescribeTimeToLiveCommand({
          TableName: CreateTableInput.name,
        }),
      );
      expect(response.TimeToLiveDescription?.AttributeName).to.equal("ttl");
      expect(["ENABLED", "ENABLING"]).to.include(
        response.TimeToLiveDescription?.TimeToLiveStatus,
      );
    });
    test("should correctly disable it", async () => {
      const client = kit.createClient();
      const CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      } as const;
      await client.createTable(CreateTableInput);
      await client.updateTimeToLive({
        table: CreateTableInput.name,
        attribute: "ttl",
        enabled: true,
      });
      await client.updateTimeToLive({
        table: CreateTableInput.name,
        attribute: "ttl",
        enabled: false,
      });
      const testClient = kit.createSdkClient();
      const response = await testClient.send(
        new DescribeTimeToLiveCommand({
          TableName: CreateTableInput.name,
        }),
      );
      // The attribute isn't part of the response when disabling.
      expect(response.TimeToLiveDescription?.AttributeName).to.be.undefined;
      expect(["DISABLED", "DISABLING"]).to.include(
        response.TimeToLiveDescription?.TimeToLiveStatus,
      );
    });
    test("should fail while disabling already disabled time to live", async () => {
      const client = kit.createClient();
      const CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      } as const;
      await client.createTable(CreateTableInput);
      await expect(
        client.updateTimeToLive({
          table: CreateTableInput.name,
          attribute: "ttl",
          enabled: false,
        }),
      ).to.be.rejected;
    });
    test("should fail while attempting to update on a different attribute", async () => {
      const client = kit.createClient();
      const CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      } as const;
      await client.createTable(CreateTableInput);
      await client.updateTimeToLive({
        table: CreateTableInput.name,
        attribute: "ttl",
        enabled: true,
      });
      await expect(
        client.updateTimeToLive({
          table: CreateTableInput.name,
          attribute: "cuntdown",
          enabled: true,
        }),
      ).to.be.rejected;
    });
    test("should fail if table does not exist", async () => {
      const client = kit.createClient();
      await expect(
        client.updateTimeToLive({
          table: "non-existent",
          attribute: "ttl",
          enabled: true,
        }),
      ).to.be.rejected;
    });
  });
};
