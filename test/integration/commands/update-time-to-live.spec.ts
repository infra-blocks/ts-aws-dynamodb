import {
  DescribeTimeToLiveCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("updateTimeToLive", () => {
    it("should correctly enable it", async function () {
      const client = this.createClient();
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
      const testClient = this.createTestClient();
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
    it("should correctly disable it", async function () {
      const client = this.createClient();
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
      const testClient = this.createTestClient();
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
    it("should fail while disabling already disabled time to live", async function () {
      const client = this.createClient();
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
    it("should fail while attempting to update on a different attribute", async function () {
      const client = this.createClient();
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
    it("should fail if table does not exist", async function () {
      const client = this.createClient();
      await expect(
        client.updateTimeToLive({
          table: "non-existent",
          attribute: "ttl",
          enabled: true,
        }),
      ).to.be.rejected;
    });
  });
});
