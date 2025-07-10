import { checkNotNull } from "@infra-blocks/checks";
import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";
import { ConditionExpression } from "../../../../src/commands/expressions/condition.js";

describe("commands.expressions.condition-expression", () => {
  describe(ConditionExpression.name, () => {
    describe(ConditionExpression.attributeNotExists.name, () => {
      it("should work with regular attribute path", () => {
        const attribute = "test.attribute";
        const condition = ConditionExpression.attributeNotExists(attribute);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({ attributeNames, attributeValues });
        const match = checkNotNull(
          /attribute_not_exists\((#.+)\)/.exec(result),
        );
        const substitution = match[1];
        expect(substitution).to.equal(attributeNames.getSubstitute(attribute));
      });
    });
    describe(ConditionExpression.attributeExists.name, () => {
      it("should work with regular attribute path", () => {
        const attribute = "test.attribute";
        const condition = ConditionExpression.attributeExists(attribute);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({ attributeNames, attributeValues });
        const match = checkNotNull(/attribute_exists\((#.+)\)/.exec(result));
        const substitution = match[1];
        expect(substitution).to.equal(attributeNames.getSubstitute(attribute));
      });
    });
    describe(ConditionExpression.attributeType.name, () => {
      it("should work with regular attribute path", () => {
        const attribute = "test.attribute";
        const type = "S";
        const condition = ConditionExpression.attributeType(attribute, type);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({ attributeNames, attributeValues });
        const match = checkNotNull(
          /attribute_type\((#.+),\s*(:.+)\)/.exec(result),
        );
        const substitution = match[1];
        const reference = match[2];
        expect(substitution).to.equal(attributeNames.getSubstitute(attribute));
        expect(reference).to.equal(attributeValues.getReference(type));
      });
    });
  });
});
