import { checkNotNull } from "@infra-blocks/checks";
import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";
import {
  attribute,
  Expression,
  ExpressionAttribute,
  ExpressionValue,
  not,
  value,
} from "../../../../src/index.js";

describe("commands.expressions.condition-expression", () => {
  // TODO: test manually how to reference `.` paths (i.e is it #path or #path.#subpath)
  describe(ExpressionAttribute.name, () => {
    describe("beginsWith", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = attribute(lhs).beginsWith(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /begins_with\((#\S+),\s*(#\S+)\)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const expression = attribute(lhs).beginsWith(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /begins_with\((#\S+),\s*(:\S+)\)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("between", () => {
      it("should work with attribute bounds", () => {
        const lhs = "test.attribute.lhs";
        const lower = "test.attribute.lower";
        const upper = "test.attribute.upper";
        const expression = attribute(lhs).between(
          attribute(lower),
          attribute(upper),
        );
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /(#\S+)\s+BETWEEN\s+(#\S+)\s+AND\s+(#\S+)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(lowerSubstitution).to.equal(attributeNames.substitute(lower));
        expect(upperSubstitution).to.equal(attributeNames.substitute(upper));
      });
      it("should work with value bounds", () => {
        const lhs = "test.attribute.lhs";
        const lower = "I am a value";
        const upper = "I am also a value";
        const expression = attribute(lhs).between(value(lower), value(upper));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /(#\S+)\s+BETWEEN\s+(:\S+)\s+AND\s+(:\S+)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(lowerSubstitution).to.equal(attributeValues.reference(lower));
        expect(upperSubstitution).to.equal(attributeValues.reference(upper));
      });
    });
    describe("contains", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = attribute(lhs).contains(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/contains\((#\S+),\s*(#\S+)\)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const expression = attribute(lhs).contains(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/contains\((#\S+),\s*(:\S+)\)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("equals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = attribute(lhs).equals(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*=\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const expression = attribute(lhs).equals(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*=\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
      it("should work with size rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I contain things";
        const expression = attribute(lhs).equals(value(rhs).size());
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*=\s*size\((:\S+)\)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("exists", () => {
      it("should work", () => {
        const name = "test.attribute";
        const expression = attribute(name).exists();
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/attribute_exists\((#.+)\)/.exec(result));
        const substitution = match[1];
        expect(substitution).to.equal(attributeNames.substitute(name));
      });
    });
    describe("greaterThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = attribute(lhs).gt(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*>\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const expression = attribute(lhs).gt(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*>\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("greaterThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = attribute(lhs).gte(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*>=\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const expression = attribute(lhs).gte(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*>=\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("in", () => {
      it("should throw when no operands are provided", () => {
        expect(() => {
          attribute("test.attribute.lhs").in();
        }).to.throw();
      });
      it("should throw when more than 100 operands are provided", () => {
        const operands = Array.from({ length: 101 }, (_, i) =>
          attribute(`test.attribute.${i}`),
        );
        expect(() => {
          attribute("test.attribute.lhs").in(...operands);
        }).to.throw();
      });
      it("should work with attribute operands", () => {
        const lhs = "test.attribute.lhs";
        const operands = [
          "test.attribute.operand1",
          "test.attribute.operand2",
          "test.attribute.operand3",
        ];
        const expression = attribute(lhs).in(
          ...operands.map((op) => attribute(op)),
        );
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /(#\S+)\s+IN\s+\((#\S+),(#\S+),(#\S+)\)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(operand1Substitution).to.equal(
          attributeNames.substitute(operands[0]),
        );
        expect(operand2Substitution).to.equal(
          attributeNames.substitute(operands[1]),
        );
        expect(operand3Substitution).to.equal(
          attributeNames.substitute(operands[2]),
        );
      });
      it("should work with value operands", () => {
        const lhs = "test.attribute.lhs";
        const operands = [
          "I am a value",
          "I am also a value",
          "I am yet another",
        ];
        const expression = attribute(lhs).in(
          ...operands.map((op) => value(op)),
        );
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /(#\S+)\s+IN\s+\((:\S+),(:\S+),(:\S+)\)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(operand1Substitution).to.equal(
          attributeValues.reference(operands[0]),
        );
        expect(operand2Substitution).to.equal(
          attributeValues.reference(operands[1]),
        );
        expect(operand3Substitution).to.equal(
          attributeValues.reference(operands[2]),
        );
      });
    });
    describe("lowerThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = attribute(lhs).lt(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*<\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const expression = attribute(lhs).lt(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*<\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("lowerThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = attribute(lhs).lte(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*<=\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const expression = attribute(lhs).lte(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*<=\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("notEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = attribute(lhs).ne(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*<>\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const expression = attribute(lhs).ne(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(#\S+)\s*<>\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeNames.substitute(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("notExists", () => {
      it("should work", () => {
        const path = "test.attribute";
        const condition = attribute(path).notExists();
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /attribute_not_exists\((#.+)\)/.exec(result),
        );
        const substitution = match[1];
        expect(substitution).to.equal(attributeNames.substitute(path));
      });
    });
    describe("type", () => {
      it("should work with string type", () => {
        const name = "test.attribute";
        const type = "S";
        const condition = attribute(name).isType(value(type));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = condition.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /attribute_type\((#.+),\s*(:.+)\)/.exec(result),
        );
        const substitution = match[1];
        const reference = match[2];
        expect(substitution).to.equal(attributeNames.substitute(name));
        expect(reference).to.equal(attributeValues.reference(type));
      });
    });
  });
  describe(ExpressionValue.name, () => {
    describe("beginsWith", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const expression = value(lhs).beginsWith(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /begins_with\((:\S+),\s*(#\S+)\)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const expression = value(lhs).beginsWith(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /begins_with\((:\S+),\s*(:\S+)\)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("between", () => {
      it("should work with attribute bounds", () => {
        const lhs = "I am a value";
        const lower = "test.attribute.lower";
        const upper = "test.attribute.upper";
        const expression = value(lhs).between(
          attribute(lower),
          attribute(upper),
        );
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /(:\S+)\s+BETWEEN\s+(#\S+)\s+AND\s+(#\S+)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(lowerSubstitution).to.equal(attributeNames.substitute(lower));
        expect(upperSubstitution).to.equal(attributeNames.substitute(upper));
      });
      it("should work with value bounds", () => {
        const lhs = "I am a value";
        const lower = "I am a also value";
        const upper = "Geezus Louizus we're all values!";
        const expression = value(lhs).between(value(lower), value(upper));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /(:\S+)\s+BETWEEN\s+(:\S+)\s+AND\s+(:\S+)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(lowerSubstitution).to.equal(attributeValues.reference(lower));
        expect(upperSubstitution).to.equal(attributeValues.reference(upper));
      });
    });
    describe("contains", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const expression = value(lhs).contains(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/contains\((:\S+),\s*(#\S+)\)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const expression = value(lhs).contains(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/contains\((:\S+),\s*(:\S+)\)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("equals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const expression = value(lhs).eq(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*=\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const expression = value(lhs).eq(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*=\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
      it("should work with size rhs", () => {
        const lhs = "I am a value";
        const rhs = "I contain things";
        const expression = value(lhs).eq(value(rhs).size());
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*=\s*size\((:\S+)\)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("greaterThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const expression = value(lhs).gt(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*>\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const expression = value(lhs).gt(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*>\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("greaterThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const expression = value(lhs).gte(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*>=\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const expression = value(lhs).gte(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*>=\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("in", () => {
      it("should throw when no operands are provided", () => {
        expect(() => {
          value("I am a value").in();
        }).to.throw();
      });
      it("should throw when more than 100 operands are provided", () => {
        const operands = Array.from({ length: 101 }, (_, i) =>
          value(`I am a value ${i}`),
        );
        expect(() => {
          value("I am a value").in(...operands);
        }).to.throw();
      });
      it("should work with attribute operands", () => {
        const lhs = "I am a value";
        const operands = [
          "test.attribute.operand1",
          "test.attribute.operand2",
          "test.attribute.operand3",
        ];
        const expression = value(lhs).in(
          ...operands.map((op) => attribute(op)),
        );
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /(:\S+)\s+IN\s+\((#\S+),(#\S+),(#\S+)\)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(operand1Substitution).to.equal(
          attributeNames.substitute(operands[0]),
        );
        expect(operand2Substitution).to.equal(
          attributeNames.substitute(operands[1]),
        );
        expect(operand3Substitution).to.equal(
          attributeNames.substitute(operands[2]),
        );
      });
      it("should work with value operands", () => {
        const lhs = "I am a value";
        const operands = [
          "I am also a value",
          "I am yet another",
          "Geezus Louizus we're all values!",
        ];
        const expression = value(lhs).in(...operands.map((op) => value(op)));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(
          /(:\S+)\s+IN\s+\((:\S+),(:\S+),(:\S+)\)/.exec(result),
        );
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(operand1Substitution).to.equal(
          attributeValues.reference(operands[0]),
        );
        expect(operand2Substitution).to.equal(
          attributeValues.reference(operands[1]),
        );
        expect(operand3Substitution).to.equal(
          attributeValues.reference(operands[2]),
        );
      });
    });
    describe("lowerThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const expression = value(lhs).lt(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*<\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const expression = value(lhs).lt(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*<\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("lowerThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const expression = value(lhs).lte(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*<=\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const expression = value(lhs).lte(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*<=\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
    describe("notEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const expression = value(lhs).ne(attribute(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*<>\s*(#\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeNames.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const expression = value(lhs).ne(value(rhs));
        const attributeNames = AttributeNames.create();
        const attributeValues = AttributeValues.create();
        const result = expression.stringify({
          attributeNames,
          attributeValues,
        });
        const match = checkNotNull(/(:\S+)\s*<>\s*(:\S+)/.exec(result));
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(attributeValues.reference(lhs));
        expect(rhsSubstitution).to.equal(attributeValues.reference(rhs));
      });
    });
  });
  describe(Expression.name, () => {
    describe("and", () => {
      it("should properly combine two conditions", () => {
        const left = "attr.left";
        const right = "attr.right";
        const leftCondition = attribute(left).exists();
        const rightCondition = attribute(right).notExists();
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
    describe("or", () => {
      it("should properly combine two conditions", () => {
        const left = "attr.left";
        const right = "attr.right";
        const leftCondition = attribute(left).exists();
        const rightCondition = attribute(right).notExists();
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
  });
  describe(not.name, () => {
    it("should properly negate the condition", () => {
      const name = "test.attribute";
      const condition = not(attribute(name).exists());
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
      expect(substitution).to.equal(attributeNames.substitute(name));
    });
  });
});
