import { checkNotNull } from "@infra-blocks/checks";
import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";
import {
  equals,
  KeyConditionExpression,
} from "../../../../src/commands/expressions/key-condition.js";

describe("commands.expressions.condition-expression", () => {
  describe(KeyConditionExpression.name, () => {
    describe(equals.name, () => {
      it("should work with regular attribute path and value", () => {
        const attribute = "test.attribute";
        const value = 42;
        const condition = equals(attribute, value);
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({ attributeNames, attributeValues });
        const match = checkNotNull(/(#.+?)\s*=\s*(:.+)/.exec(result));
        const substitution = match[1];
        const reference = match[2];
        expect(substitution).to.equal(attributeNames.substitute(attribute));
        expect(reference).to.equal(attributeValues.reference(value));
      });
    });
  });
});
