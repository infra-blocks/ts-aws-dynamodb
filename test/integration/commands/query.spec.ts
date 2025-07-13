import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { asyncArrayCollect } from "@infra-blocks/iter";
import { expect } from "@infra-blocks/test";
import {
  attribute,
  type CreateTableParams,
  value,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("query", () => {
    it("should work on table without sort key", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);
      const testClient = this.createTestClient();
      await testClient.send(
        new PutItemCommand({
          TableName: createTableParams.name,
          Item: { pk: { S: "User#BigToto" } },
        }),
      );

      const result = client.query({
        table: createTableParams.name,
        condition: attribute("pk").equals(value("User#BigToto")),
      });
      const items = await asyncArrayCollect(result);
      expect(items).to.have.lengthOf(1);
      expect(items[0]).to.deep.include({
        pk: "User#BigToto",
      });
    });
  });
  it("should work on table with sort key", async function () {
    const client = this.createClient();
    const createTableParams: CreateTableParams = {
      name: "test-table",
      primaryKey: {
        partitionKey: { name: "pk", type: "S" },
        sortKey: { name: "sk", type: "N" },
      },
    };
    await client.createTable(createTableParams);
    const testClient = this.createTestClient();
    await testClient.send(
      new PutItemCommand({
        TableName: createTableParams.name,
        Item: { pk: { S: "User#BigToto" }, sk: { N: "25" } },
      }),
    );

    const result = client.query({
      table: createTableParams.name,
      condition: attribute("pk").equals(value("User#BigToto")),
    });
    const items = await asyncArrayCollect(result);
    expect(items).to.have.lengthOf(1);
    expect(items[0]).to.deep.include({
      pk: "User#BigToto",
      sk: 25,
    });
  });
});
