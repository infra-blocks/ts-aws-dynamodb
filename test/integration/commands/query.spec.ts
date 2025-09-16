import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { asyncArrayCollect } from "@infra-blocks/iter";
import { expect } from "@infra-blocks/test";
import { type CreateTableParams, path, value } from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe("Query", () => {
  afterEach("clean up", dropAllTables());

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
      condition: [path("pk"), "=", value("User#BigToto")],
    });
    const items = await asyncArrayCollect(result);
    expect(items).to.have.lengthOf(1);
    expect(items[0]).to.deep.include({
      pk: "User#BigToto",
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
      condition: [path("pk"), "=", value("User#BigToto")],
    });
    const items = await asyncArrayCollect(result);
    expect(items).to.have.lengthOf(1);
    expect(items[0]).to.deep.include({
      pk: "User#BigToto",
      sk: 25,
    });
  });
  it("should work on table with email partition key", async function () {
    const client = this.createClient();
    const createTableParams: CreateTableParams = {
      name: "test-table",
      primaryKey: {
        partitionKey: { name: "email", type: "S" },
      },
    };
    await client.createTable(createTableParams);
    const testClient = this.createTestClient();
    await testClient.send(
      new PutItemCommand({
        TableName: createTableParams.name,
        Item: { email: { S: "joe.cunt@gmail.com" } },
      }),
    );

    const result = client.query({
      table: createTableParams.name,
      condition: ["email", "=", value("joe.cunt@gmail.com")],
    });
    const items = await asyncArrayCollect(result);
    expect(items).to.have.lengthOf(1);
    expect(items[0]).to.deep.include({
      email: "joe.cunt@gmail.com",
    });
  });
});
