import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { expect } from "@infra-blocks/test";
import {
  add,
  attributeExists,
  attributeNotExists,
  deleteFrom,
  ifNotExists,
  path,
  remove,
  set,
  value,
} from "../../../src/index.js";
import { dropAllTables } from "../fixtures.js";
import { expectConditionCheckFailure } from "./lib.js";

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
      const output = await client.updateItem({
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
      expect(output).to.be.empty;
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
    it("should work with return values specified to ALL_OLD", async function () {
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
        oldField: "hello?",
      };
      await client.putItem({ table, item });
      // Test the update.
      const output = await client.updateItem({
        table,
        key: { pk: item.pk },
        update: [set("newField", value("bye!")), remove("oldField")],
        returnValues: "ALL_OLD",
      });
      expect(output).to.deep.equal({ attributes: item });

      // Sanity check on the final result.
      const finalItem = await client.getItem({ table, key: { pk: item.pk } });
      expect(finalItem).to.deep.equal({
        item: {
          pk: item.pk,
          newField: "bye!",
        },
      });
    });
    it("should work with return values specified to UPDATED_OLD", async function () {
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
        oldField: "hello?",
      };
      await client.putItem({ table, item });
      // Test the update.
      const output = await client.updateItem({
        table,
        key: { pk: item.pk },
        update: [set("newField", value("bye!")), remove("oldField")],
        returnValues: "UPDATED_OLD",
      });
      // Only returning the updated fields.
      expect(output).to.deep.equal({ attributes: { oldField: "hello?" } });

      // Sanity check on the final result.
      const finalItem = await client.getItem({ table, key: { pk: item.pk } });
      expect(finalItem).to.deep.equal({
        item: {
          pk: item.pk,
          newField: "bye!",
        },
      });
    });
    it("should work with return values specified to ALL_NEW", async function () {
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
        oldField: "hello?",
      };
      await client.putItem({ table, item });
      // Test the update.
      const output = await client.updateItem({
        table,
        key: { pk: item.pk },
        update: [set("newField", value("bye!")), remove("oldField")],
        returnValues: "ALL_NEW",
      });
      const newItem = {
        pk: "BigIron#1",
        newField: "bye!",
      };
      expect(output).to.deep.equal({ attributes: newItem });
      // Same as the actual item.
      const finalItem = await client.getItem({ table, key: { pk: item.pk } });
      expect(finalItem).to.deep.equal({ item: newItem });
    });
    it("should work with return values specified to UPDATED_NEW", async function () {
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
        oldField: "hello?",
      };
      await client.putItem({ table, item });
      // Test the update.
      const output = await client.updateItem({
        table,
        key: { pk: item.pk },
        update: [set("newField", value("bye!")), remove("oldField")],
        returnValues: "UPDATED_NEW",
      });
      expect(output).to.deep.equal({ attributes: { newField: "bye!" } });
      const finalItem = await client.getItem({ table, key: { pk: item.pk } });
      expect(finalItem).to.deep.equal({
        item: {
          pk: "BigIron#1",
          newField: "bye!",
        },
      });
    });
    it("should work with condition check return values specified to ALL_OLD", async function () {
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
        oldField: "hello?",
      };
      await client.putItem({ table, item });
      await expectConditionCheckFailure(
        () =>
          client.updateItem({
            table,
            key: { pk: item.pk },
            update: [set("newField", value("bye!"))],
            condition: attributeNotExists("oldField"),
            returnValuesOnConditionCheckFailure: "ALL_OLD",
          }),
        (err) =>
          expect(err.Item).to.deep.equal({
            pk: { S: "BigIron#1" },
            oldField: { S: "hello?" },
          }),
      );
    });
  });
});
