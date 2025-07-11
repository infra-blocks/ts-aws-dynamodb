import { checkNotNull } from "@infra-blocks/checks";
import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";
import {
  attributeExists,
  attributeNotExists,
  attributeType,
  ConditionExpression,
  not,
} from "../../../../src/index.js";

describe("commands.expressions.condition-expression", () => {
  describe(ConditionExpression.name, () => {
    describe(attributeNotExists.name, () => {
      it("should work with regular attribute path", () => {
        const attribute = "test.attribute";
        const condition = attributeNotExists(attribute);
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
    describe(attributeExists.name, () => {
      it("should work with regular attribute path", () => {
        const attribute = "test.attribute";
        const condition = attributeExists(attribute);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({ attributeNames, attributeValues });
        const match = checkNotNull(/attribute_exists\((#.+)\)/.exec(result));
        const substitution = match[1];
        expect(substitution).to.equal(attributeNames.getSubstitute(attribute));
      });
    });
    describe(attributeType.name, () => {
      it("should work with regular attribute path", () => {
        const attribute = "test.attribute";
        const type = "S";
        const condition = attributeType(attribute, type);
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
    describe("or", () => {
      it("should properly combine two conditions", () => {
        const left = "attr.left";
        const right = "attr.right";
        const leftCondition = attributeExists(left);
        const rightCondition = attributeNotExists(right);
        const condition = leftCondition.or(rightCondition);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /\(attribute_exists\((#.+)\) OR attribute_not_exists\((#.+)\)\)/.exec(
            result,
          ),
        );
        const leftSubstitution = match[1];
        const rightSubstitution = match[2];
        expect(leftSubstitution).to.equal(attributeNames.getSubstitute(left));
        expect(rightSubstitution).to.equal(attributeNames.getSubstitute(right));
      });
    });
    describe("and", () => {
      it("should properly combine two conditions", () => {
        const left = "attr.left";
        const right = "attr.right";
        const leftCondition = attributeExists(left);
        const rightCondition = attributeNotExists(right);
        const condition = leftCondition.and(rightCondition);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /\(attribute_exists\((#.+)\) AND attribute_not_exists\((#.+)\)\)/.exec(
            result,
          ),
        );
        const leftSubstitution = match[1];
        const rightSubstitution = match[2];
        expect(leftSubstitution).to.equal(attributeNames.getSubstitute(left));
        expect(rightSubstitution).to.equal(attributeNames.getSubstitute(right));
      });
    });
    describe("not", () => {
      it("should properly negate the condition", () => {
        const attribute = "test.attribute";
        const condition = not(attributeExists(attribute));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({ attributeNames, attributeValues });
        const match = checkNotNull(
          /NOT \(attribute_exists\((#.+)\)\)/.exec(result),
        );
        const substitution = match[1];
        expect(substitution).to.equal(attributeNames.getSubstitute(attribute));
      });
    });
  });
});
