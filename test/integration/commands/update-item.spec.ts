import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import {
  add,
  attributeExists,
  deleteFrom,
  ifNotExists,
  path,
  remove,
  set,
  value,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";

describe(DynamoDBClient.name, () => {
  afterEach("clean up", dropAllTables());

  describe("updateItem", () => {
    it("should work on table without sort key", async function () {
      const client = this.createClient();
      const table = "test-table";
      await client.createTable({
        name: table,
        keySchema: {
          partitionKey: { name: "pk", type: "S" },
        },
      });
      const item = {
        pk: "BigIron#1",
        // Going to update this field later.
        stuff: {
          "kebab-field": 42,
          removeMe: "please",
          addMe: new Set([1, 2, 3]),
          deleteFromMe: new Set(["one", "two", "three"]),
        },
      };
      await client.putItem({ table, item });
      // Test the update.
      await client.updateItem({
        table,
        key: { pk: item.pk },
        update: [
          set(
            path("stuff.kebab-field"),
            ifNotExists(path("default.add"), value(0)),
          ),
          remove(path("stuff.removeMe")),
          add(path("stuff.addMe"), value(new Set([4]))),
          deleteFrom(path("stuff.deleteFromMe"), value(new Set(["one"]))),
        ],
        condition: attributeExists(path("stuff.kebab-field")),
      });
      // Check the result.
      const result = await client.getItem({ table, key: { pk: item.pk } });
      expect(result).to.deep.equal({
        item: {
          pk: item.pk,
          stuff: {
            "kebab-field": 0,
            addMe: new Set([1, 2, 3, 4]),
            deleteFromMe: new Set(["two", "three"]),
          },
        },
      });
    });
  });
});
