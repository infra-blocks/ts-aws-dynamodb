import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import {
  add,
  attribute,
  type CreateTableParams,
  deleteFrom,
  ifNotExists,
  type PutItemParams,
  remove,
  set,
  value,
  where,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("updateItem", () => {
    it("should work on table without sort key", async function () {
      const client = this.createClient();
      const createTableParams: CreateTableParams = {
        name: "test-table",
        primaryKey: {
          partitionKey: { name: "pk", type: "S" },
        },
      };
      await client.createTable(createTableParams);
      const putItemParams: PutItemParams = {
        table: createTableParams.name,
        item: {
          pk: "BigIron#1",
          // Going to update this field later.
          stuff: {
            "kebab-field": 42,
            removeMe: "please",
            addMe: new Set([1, 2, 3]),
            deleteFromMe: new Set(["one", "two", "three"]),
          },
        },
      };
      await client.putItem(putItemParams);
      // Test the update.
      await client.updateItem({
        table: createTableParams.name,
        key: { pk: putItemParams.item.pk },
        update: [
          set(
            attribute("stuff.kebab-field"),
            ifNotExists(attribute("default.add"), value(0)),
          ),
          remove(attribute("stuff.removeMe")),
          add(attribute("stuff.addMe"), value(new Set([4]))),
          deleteFrom(attribute("stuff.deleteFromMe"), value(new Set(["one"]))),
        ],
        condition: where(attribute("stuff.kebab-field")).exists(),
      });
      // Check the result.
      const item = await client.getItem({
        table: createTableParams.name,
        key: { pk: putItemParams.item.pk },
      });
      expect(item).to.deep.include({
        pk: putItemParams.item.pk,
        stuff: {
          "kebab-field": 0,
          addMe: new Set([1, 2, 3, 4]),
          deleteFromMe: new Set(["two", "three"]),
        },
      });
    });
  });
});
