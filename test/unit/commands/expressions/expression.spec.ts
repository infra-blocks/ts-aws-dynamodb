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

describe("commands.expressions.expression", () => {
  function expressionMatch(params: {
    expression: Expression;
    matcher: RegExp;
  }): {
    names: AttributeNames;
    values: AttributeValues;
    match: RegExpExecArray;
  } {
    const { expression, matcher } = params;
    const names = AttributeNames.create();
    const values = AttributeValues.create();
    const match = checkNotNull(
      matcher.exec(
        expression.stringify({
          attributeNames: names,
          attributeValues: values,
        }),
      ),
    );
    return {
      names: names,
      values: values,
      match,
    };
  }

  // TODO: test manually how to reference `.` paths (i.e is it #path or #path.#subpath)
  describe(ExpressionAttribute.name, () => {
    describe("beginsWith", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = attribute(lhs).beginsWith(attribute(rhs));
        const { match, names } = expressionMatch({
          expression,
          matcher: /begins_with\((#\S+),\s*(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).beginsWith(value(rhs)),
          matcher: /begins_with\((#\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("between", () => {
      it("should work with attribute bounds", () => {
        const lhs = "test.attribute.lhs";
        const lower = "test.attribute.lower";
        const upper = "test.attribute.upper";
        const { match, names } = expressionMatch({
          expression: attribute(lhs).between(
            attribute(lower),
            attribute(upper),
          ),
          matcher: /(#\S+)\s+BETWEEN\s+(#\S+)\s+AND\s+(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(lowerSubstitution).to.equal(names.substitute(lower));
        expect(upperSubstitution).to.equal(names.substitute(upper));
      });
      it("should work with value bounds", () => {
        const lhs = "test.attribute.lhs";
        const lower = "I am a value";
        const upper = "I am also a value";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).between(value(lower), value(upper)),
          matcher: /(#\S+)\s+BETWEEN\s+(:\S+)\s+AND\s+(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(lowerSubstitution).to.equal(values.reference(lower));
        expect(upperSubstitution).to.equal(values.reference(upper));
      });
    });
    describe("contains", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = expressionMatch({
          expression: attribute(lhs).contains(attribute(rhs)),
          matcher: /contains\((#\S+),\s*(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).contains(value(rhs)),
          matcher: /contains\((#\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("equals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = expressionMatch({
          expression: attribute(lhs).equals(attribute(rhs)),
          matcher: /(#\S+)\s*=\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).equals(value(rhs)),
          matcher: /(#\S+)\s*=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
      it("should work with size rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I contain things";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).equals(value(rhs).size()),
          matcher: /(#\S+)\s*=\s*size\((:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("exists", () => {
      it("should work", () => {
        const name = "test.attribute";
        const { match, names } = expressionMatch({
          expression: attribute(name).exists(),
          matcher: /attribute_exists\((#.+)\)/,
        });
        const substitution = match[1];
        expect(substitution).to.equal(names.substitute(name));
      });
    });
    describe("greaterThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = expressionMatch({
          expression: attribute(lhs).gt(attribute(rhs)),
          matcher: /(#\S+)\s*>\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).gt(value(rhs)),
          matcher: /(#\S+)\s*>\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("greaterThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = expressionMatch({
          expression: attribute(lhs).gte(attribute(rhs)),
          matcher: /(#\S+)\s*>=\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).gte(value(rhs)),
          matcher: /(#\S+)\s*>=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
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
        const { match, names } = expressionMatch({
          expression: attribute(lhs).in(...operands.map((op) => attribute(op))),
          matcher: /(#\S+)\s+IN\s+\((#\S+),(#\S+),(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(operand1Substitution).to.equal(names.substitute(operands[0]));
        expect(operand2Substitution).to.equal(names.substitute(operands[1]));
        expect(operand3Substitution).to.equal(names.substitute(operands[2]));
      });
      it("should work with value operands", () => {
        const lhs = "test.attribute.lhs";
        const operands = [
          "I am a value",
          "I am also a value",
          "I am yet another",
        ];
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).in(...operands.map((op) => value(op))),
          matcher: /(#\S+)\s+IN\s+\((:\S+),(:\S+),(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(operand1Substitution).to.equal(values.reference(operands[0]));
        expect(operand2Substitution).to.equal(values.reference(operands[1]));
        expect(operand3Substitution).to.equal(values.reference(operands[2]));
      });
    });
    describe("lowerThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = expressionMatch({
          expression: attribute(lhs).lt(attribute(rhs)),
          matcher: /(#\S+)\s*<\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).lt(value(rhs)),
          matcher: /(#\S+)\s*<\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("lowerThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = expressionMatch({
          expression: attribute(lhs).lte(attribute(rhs)),
          matcher: /(#\S+)\s*<=\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).lte(value(rhs)),
          matcher: /(#\S+)\s*<=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("notEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = expressionMatch({
          expression: attribute(lhs).ne(attribute(rhs)),
          matcher: /(#\S+)\s*<>\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I am a value";
        const { match, names, values } = expressionMatch({
          expression: attribute(lhs).ne(value(rhs)),
          matcher: /(#\S+)\s*<>\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("notExists", () => {
      it("should work", () => {
        const path = "test.attribute";
        const { match, names } = expressionMatch({
          expression: attribute(path).notExists(),
          matcher: /attribute_not_exists\((#.+)\)/,
        });
        const substitution = match[1];
        expect(substitution).to.equal(names.substitute(path));
      });
    });
    describe("type", () => {
      it("should work with string type", () => {
        const name = "test.attribute";
        const type = "S";
        const { match, names, values } = expressionMatch({
          expression: attribute(name).isType(value(type)),
          matcher: /attribute_type\((#.+),\s*(:.+)\)/,
        });
        const substitution = match[1];
        const reference = match[2];
        expect(substitution).to.equal(names.substitute(name));
        expect(reference).to.equal(values.reference(type));
      });
    });
  });
  describe(ExpressionValue.name, () => {
    describe("beginsWith", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = expressionMatch({
          expression: value(lhs).beginsWith(attribute(rhs)),
          matcher: /begins_with\((:\S+),\s*(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = expressionMatch({
          expression: value(lhs).beginsWith(value(rhs)),
          matcher: /begins_with\((:\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("between", () => {
      it("should work with attribute bounds", () => {
        const lhs = "I am a value";
        const lower = "test.attribute.lower";
        const upper = "test.attribute.upper";
        const { match, names, values } = expressionMatch({
          expression: value(lhs).between(attribute(lower), attribute(upper)),
          matcher: /(:\S+)\s+BETWEEN\s+(#\S+)\s+AND\s+(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(lowerSubstitution).to.equal(names.substitute(lower));
        expect(upperSubstitution).to.equal(names.substitute(upper));
      });
      it("should work with value bounds", () => {
        const lhs = "I am a value";
        const lower = "I am a also value";
        const upper = "Geezus Louizus we're all values!";
        const { match, values } = expressionMatch({
          expression: value(lhs).between(value(lower), value(upper)),
          matcher: /(:\S+)\s+BETWEEN\s+(:\S+)\s+AND\s+(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(lowerSubstitution).to.equal(values.reference(lower));
        expect(upperSubstitution).to.equal(values.reference(upper));
      });
    });
    describe("contains", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = expressionMatch({
          expression: value(lhs).contains(attribute(rhs)),
          matcher: /contains\((:\S+),\s*(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = expressionMatch({
          expression: value(lhs).contains(value(rhs)),
          matcher: /contains\((:\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("equals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = expressionMatch({
          expression: value(lhs).eq(attribute(rhs)),
          matcher: /(:\S+)\s*=\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = expressionMatch({
          expression: value(lhs).eq(value(rhs)),
          matcher: /(:\S+)\s*=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
      it("should work with size rhs", () => {
        const lhs = "I am a value";
        const rhs = "I contain things";
        const { match, values } = expressionMatch({
          expression: value(lhs).eq(value(rhs).size()),
          matcher: /(:\S+)\s*=\s*size\((:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("greaterThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = expressionMatch({
          expression: value(lhs).gt(attribute(rhs)),
          matcher: /(:\S+)\s*>\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = expressionMatch({
          expression: value(lhs).gt(value(rhs)),
          matcher: /(:\S+)\s*>\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("greaterThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = expressionMatch({
          expression: value(lhs).gte(attribute(rhs)),
          matcher: /(:\S+)\s*>=\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = expressionMatch({
          expression: value(lhs).gte(value(rhs)),
          matcher: /(:\S+)\s*>=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
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
        const { match, names, values } = expressionMatch({
          expression: value(lhs).in(...operands.map((op) => attribute(op))),
          matcher: /(:\S+)\s+IN\s+\((#\S+),(#\S+),(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(operand1Substitution).to.equal(names.substitute(operands[0]));
        expect(operand2Substitution).to.equal(names.substitute(operands[1]));
        expect(operand3Substitution).to.equal(names.substitute(operands[2]));
      });
      it("should work with value operands", () => {
        const lhs = "I am a value";
        const operands = [
          "I am also a value",
          "I am yet another",
          "Geezus Louizus we're all values!",
        ];
        const { match, values } = expressionMatch({
          expression: value(lhs).in(...operands.map((op) => value(op))),
          matcher: /(:\S+)\s+IN\s+\((:\S+),(:\S+),(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(operand1Substitution).to.equal(values.reference(operands[0]));
        expect(operand2Substitution).to.equal(values.reference(operands[1]));
        expect(operand3Substitution).to.equal(values.reference(operands[2]));
      });
    });
    describe("lowerThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = expressionMatch({
          expression: value(lhs).lt(attribute(rhs)),
          matcher: /(:\S+)\s*<\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = expressionMatch({
          expression: value(lhs).lt(value(rhs)),
          matcher: /(:\S+)\s*<\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("lowerThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = expressionMatch({
          expression: value(lhs).lte(attribute(rhs)),
          matcher: /(:\S+)\s*<=\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = expressionMatch({
          expression: value(lhs).lte(value(rhs)),
          matcher: /(:\S+)\s*<=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
    describe("notEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = expressionMatch({
          expression: value(lhs).ne(attribute(rhs)),
          matcher: /(:\S+)\s*<>\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = expressionMatch({
          expression: value(lhs).ne(value(rhs)),
          matcher: /(:\S+)\s*<>\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.reference(lhs));
        expect(rhsSubstitution).to.equal(values.reference(rhs));
      });
    });
  });
  describe(Expression.name, () => {
    describe("and", () => {
      it("should properly combine two expressions", () => {
        const left = "attr.left";
        const right = "attr.right";
        const leftExpression = attribute(left).exists();
        const rightExpression = attribute(right).notExists();
        const { match, names } = expressionMatch({
          expression: leftExpression.and(rightExpression),
          matcher:
            /\(attribute_exists\((#.+)\) AND attribute_not_exists\((#.+)\)\)/,
        });
        const leftSubstitution = match[1];
        const rightSubstitution = match[2];
        expect(leftSubstitution).to.equal(names.substitute(left));
        expect(rightSubstitution).to.equal(names.substitute(right));
      });
    });
    describe("or", () => {
      it("should properly combine two expressions", () => {
        const left = "attr.left";
        const right = "attr.right";
        const leftExpression = attribute(left).exists();
        const rightExpression = attribute(right).notExists();
        const { match, names } = expressionMatch({
          expression: leftExpression.or(rightExpression),
          matcher:
            /\(attribute_exists\((#.+)\) OR attribute_not_exists\((#.+)\)\)/,
        });
        const leftSubstitution = match[1];
        const rightSubstitution = match[2];
        expect(leftSubstitution).to.equal(names.substitute(left));
        expect(rightSubstitution).to.equal(names.substitute(right));
      });
    });
  });
  describe(not.name, () => {
    it("should properly negate the expression", () => {
      const name = "test.attribute";
      const { match, names } = expressionMatch({
        expression: not(attribute(name).exists()),
        matcher: /NOT \(attribute_exists\((#.+)\)\)/,
      });
      const substitution = match[1];
      expect(substitution).to.equal(names.substitute(name));
    });
  });
});
