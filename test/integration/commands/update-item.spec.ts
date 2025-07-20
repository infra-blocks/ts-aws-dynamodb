import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import {
  add,
  attribute,
  type CreateTableParams,
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
          },
        },
      };
      await client.putItem(putItemParams);
      // Test the update.
      await client.updateItem({
        table: createTableParams.name,
        // TODO: review this design to be more concise? Like call it just key with two fields?
        // The native implementation uses a record, which is good enough. This can only fail at runtime for now anyway.
        // Maybe use a generic type in the field that defaults to record?
        partitionKey: { name: "pk", value: putItemParams.item.pk },
        update: [
          set(attribute("stuff.kebab-field")).to(
            ifNotExists(attribute("default.add"), value(0)),
          ),
          remove(attribute("stuff.removeMe")),
          add(attribute("stuff.addMe"), value(new Set([4]))),
        ],
        condition: where(attribute("stuff.kebab-field")).exists(),
      });
      // Check the result.
      const item = await client.getItem({
        table: createTableParams.name,
        partitionKey: { name: "pk", value: putItemParams.item.pk },
      });
      expect(item).to.deep.include({
        pk: putItemParams.item.pk,
        stuff: {
          "kebab-field": 0,
          addMe: new Set([1, 2, 3, 4]),
        },
      });
    });
  });
});
