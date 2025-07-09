import { checkNotNull } from "@infra-blocks/checks";
import { expect } from "@infra-blocks/test";
import { ConditionExpression } from "../../src/commands/expressions/condition.js";

describe("lib.dynamodb.condition-expression", () => {
  describe(ConditionExpression.name, () => {
    describe(ConditionExpression.attributeNotExists.name, () => {
      it("should work with regular attribute path", () => {
        const attribute = "test.attribute";
        const condition = ConditionExpression.attributeNotExists(attribute);
        const result = condition.toAwsInput();
        const match = checkNotNull(
          /attribute_not_exists\((#.+)\)/.exec(result.ConditionExpression),
        );
        const substitution = match[1];
        expect(condition.toAwsInput()).to.deep.equal({
          ConditionExpression: `attribute_not_exists(${substitution})`,
          ExpressionAttributeNames: { [substitution]: attribute },
        });
      });
    });
    describe(ConditionExpression.attributeExists.name, () => {
      it("should work with regular attribute path", () => {
        const attribute = "test.attribute";
        const condition = ConditionExpression.attributeExists(attribute);
        const result = condition.toAwsInput();
        const match = checkNotNull(
          /attribute_exists\((#.+)\)/.exec(result.ConditionExpression),
        );
        const substitution = match[1];
        expect(condition.toAwsInput()).to.deep.equal({
          ConditionExpression: `attribute_exists(${substitution})`,
          ExpressionAttributeNames: { [substitution]: attribute },
        });
      });
    });
    describe(ConditionExpression.attributeType.name, () => {
      it("should work with regular attribute path", () => {
        const attribute = "test.attribute";
        const type = "S";
        const condition = ConditionExpression.attributeType(attribute, type);
        const result = condition.toAwsInput();
        const match = checkNotNull(
          /attribute_type\((#.+),\s*(:.+)\)/.exec(result.ConditionExpression),
        );
        const substitution = match[1];
        const reference = match[2];
        expect(condition.toAwsInput()).to.deep.equal({
          ConditionExpression: `attribute_type(${substitution}, ${reference})`,
          ExpressionAttributeNames: { [substitution]: attribute },
          ExpressionAttributeValues: { [reference]: type },
        });
      });
    });
  });
});
