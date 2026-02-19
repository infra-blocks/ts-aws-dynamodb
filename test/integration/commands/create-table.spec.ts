import { DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import type { CreateTableInput } from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("createTable", () => {
    it("should work without sort key nor indexes", async function () {
      const client = this.createClient();
      const params: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(params);
      const testClient = this.createTestClient();
      const response = await testClient.send(
        new DescribeTableCommand({
          TableName: params.name,
        }),
      );
      expect(response.Table).to.deep.include({
        TableName: params.name,
        KeySchema: [{ AttributeName: "pk", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "pk", AttributeType: "S" }],
      });
    });
    it("should work with sort key and no indexes", async function () {
      const client = this.createClient();
      const params: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
      };
      await client.createTable(params);
      const testClient = this.createTestClient();
      const response = await testClient.send(
        new DescribeTableCommand({
          TableName: params.name,
        }),
      );
      expect(response.Table).to.deep.include({
        TableName: params.name,
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" },
          { AttributeName: "sk", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          { AttributeName: "pk", AttributeType: "S" },
          { AttributeName: "sk", AttributeType: "N" },
        ],
      });
    });
    it("should work with a local secondary index", async function () {
      const client = this.createClient();
      const params: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
        lsis: {
          search: {
            partitionKey: { name: "pk", type: "S" },
            sortKey: { name: "searchBy", type: "S" },
          },
        },
      };
      await client.createTable(params);
      const testClient = this.createTestClient();
      const response = await testClient.send(
        new DescribeTableCommand({
          TableName: params.name,
        }),
      );
      expect(response.Table).to.deep.include({
        TableName: params.name,
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" },
          { AttributeName: "sk", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          { AttributeName: "pk", AttributeType: "S" },
          { AttributeName: "sk", AttributeType: "N" },
          { AttributeName: "searchBy", AttributeType: "S" },
        ],
      });
      expect(response.Table?.LocalSecondaryIndexes).to.have.lengthOf(1);
      expect(response.Table?.LocalSecondaryIndexes?.[0]).to.deep.include({
        IndexName: "search",
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" },
          { AttributeName: "searchBy", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      });
    });
    it("should work with a global secondary index", async function () {
      const client = this.createClient();
      const params: CreateTableInput = {
        name: "test-table",
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
          sortKey: { name: "sk", type: "N" },
        },
        gsis: {
          otherIndex: {
            partitionKey: { name: "otherPk", type: "S" },
            sortKey: { name: "pk", type: "S" },
          },
        },
      };
      await client.createTable(params);
      const testClient = this.createTestClient();
      const response = await testClient.send(
        new DescribeTableCommand({
          TableName: params.name,
        }),
      );
      expect(response.Table).to.deep.include({
        TableName: params.name,
        KeySchema: [
          { AttributeName: "pk", KeyType: "HASH" },
          { AttributeName: "sk", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
          { AttributeName: "pk", AttributeType: "S" },
          { AttributeName: "sk", AttributeType: "N" },
          { AttributeName: "otherPk", AttributeType: "S" },
        ],
      });
      expect(response.Table?.GlobalSecondaryIndexes).to.have.lengthOf(1);
      expect(response.Table?.GlobalSecondaryIndexes?.[0]).to.deep.include({
        IndexName: "otherIndex",
        KeySchema: [
          { AttributeName: "otherPk", KeyType: "HASH" },
          { AttributeName: "pk", KeyType: "RANGE" },
        ],
        Projection: { ProjectionType: "ALL" },
      });
    });
  });
});
