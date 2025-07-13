import { checkNotNull } from "@infra-blocks/checks";
import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";
import {
  attributeExists,
  attributeNotExists,
  attributeType,
  beginsWith,
  ConditionExpression,
  contains,
  not,
  size,
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
        expect(substitution).to.equal(attributeNames.substitute(attribute));
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
        expect(substitution).to.equal(attributeNames.substitute(attribute));
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
        expect(substitution).to.equal(attributeNames.substitute(attribute));
        expect(reference).to.equal(attributeValues.reference(type));
      });
    });
    describe(beginsWith.name, () => {
      it("should work with regular attribute path and value", () => {
        const attribute = "test.attribute";
        const value = "prefix";
        const condition = beginsWith(attribute, value);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({ attributeNames, attributeValues });
        const match = checkNotNull(
          /begins_with\((#.+),\s*(:.+)\)/.exec(result),
        );
        const substitution = match[1];
        const reference = match[2];
        expect(substitution).to.equal(attributeNames.substitute(attribute));
        expect(reference).to.equal(attributeValues.reference(value));
      });
    });
    describe(contains.name, () => {
      it("should work with regular attribute path and value", () => {
        const attribute = "test.attribute";
        const value = "substring";
        const condition = contains(attribute, value);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({ attributeNames, attributeValues });
        const match = checkNotNull(/contains\((#.+),\s*(:.+)\)/.exec(result));
        const substitution = match[1];
        const reference = match[2];
        expect(substitution).to.equal(attributeNames.substitute(attribute));
        expect(reference).to.equal(attributeValues.reference(value));
      });
      it("should work with the size function as value", () => {
        const attribute = "test.attribute";
        const sizedAttribute = "test.sized_attribute";
        const value = size(sizedAttribute);
        const condition = contains(attribute, value);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({ attributeNames, attributeValues });
        const match = checkNotNull(
          /contains\((#.+),\s*size\((#.+)\)\)/.exec(result),
          "mismatched result %s",
          result,
        );
        const substitution = match[1];
        const sizeSubstitution = match[2];
        expect(substitution).to.equal(attributeNames.substitute(attribute));
        expect(sizeSubstitution).to.equal(
          attributeNames.substitute(sizedAttribute),
        );
      });
    });
    describe("logical operators", () => {
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
          expect(leftSubstitution).to.equal(attributeNames.substitute(left));
          expect(rightSubstitution).to.equal(attributeNames.substitute(right));
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
          expect(leftSubstitution).to.equal(attributeNames.substitute(left));
          expect(rightSubstitution).to.equal(attributeNames.substitute(right));
        });
      });
      describe("not", () => {
        it("should properly negate the condition", () => {
          const attribute = "test.attribute";
          const condition = not(attributeExists(attribute));
          const attributeNames = AttributeNames.create();
          const attributeValues = AttributeValues.create();
          const result = condition.stringify({
            attributeNames,
            attributeValues,
          });
          const match = checkNotNull(
            /NOT \(attribute_exists\((#.+)\)\)/.exec(result),
          );
          const substitution = match[1];
          expect(substitution).to.equal(attributeNames.substitute(attribute));
        });
      });
    });
  });
});
