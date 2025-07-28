import { checkNotNull } from "@infra-blocks/checks";
import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";
import {
  Condition,
  not,
  PathOperand,
  path,
  size,
  ValueOperand,
  value,
  where,
} from "../../../../src/index.js";

describe("commands.expressions.condition", () => {
  function conditionMatch(params: { condition: Condition; matcher: RegExp }): {
    names: AttributeNames;
    values: AttributeValues;
    match: RegExpExecArray;
  } {
    const { condition, matcher } = params;
    const names = AttributeNames.create();
    const values = AttributeValues.create();
    const match = checkNotNull(
      matcher.exec(condition.stringify({ names, values })),
    );
    return {
      names: names,
      values: values,
      match,
    };
  }

  // TODO: test manually how to reference `.` paths (i.e is it #path or #path.#subpath)
  describe(PathOperand.name, () => {
    describe("beginsWith", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const expression = where(path(lhs)).beginsWith(path(rhs));
        const { match, names } = conditionMatch({
          condition: expression,
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).beginsWith(value(rhs)),
          matcher: /begins_with\((#\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("between", () => {
      it("should work with attribute bounds", () => {
        const lhs = "test.attribute.lhs";
        const lower = "test.attribute.lower";
        const upper = "test.attribute.upper";
        const { match, names } = conditionMatch({
          condition: where(path(lhs)).between(path(lower), path(upper)),
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).between(value(lower), value(upper)),
          matcher: /(#\S+)\s+BETWEEN\s+(:\S+)\s+AND\s+(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(lowerSubstitution).to.equal(values.substitute(lower));
        expect(upperSubstitution).to.equal(values.substitute(upper));
      });
    });
    describe("contains", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = conditionMatch({
          condition: where(path(lhs)).contains(path(rhs)),
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).contains(value(rhs)),
          matcher: /contains\((#\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("equals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = conditionMatch({
          condition: where(path(lhs)).equals(path(rhs)),
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).equals(value(rhs)),
          matcher: /(#\S+)\s*=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
      it("should work with size rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "I contain things";
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).equals(size(value(rhs))),
          matcher: /(#\S+)\s*=\s*size\((:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("exists", () => {
      it("should work", () => {
        const name = "test.attribute";
        const { match, names } = conditionMatch({
          condition: where(path(name)).exists(),
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
        const { match, names } = conditionMatch({
          condition: where(path(lhs)).gt(path(rhs)),
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).gt(value(rhs)),
          matcher: /(#\S+)\s*>\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("greaterThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = conditionMatch({
          condition: where(path(lhs)).gte(path(rhs)),
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).gte(value(rhs)),
          matcher: /(#\S+)\s*>=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("in", () => {
      it("should throw when no operands are provided", () => {
        expect(() => {
          where(path("test.attribute.lhs")).in();
        }).to.throw();
      });
      it("should throw when more than 100 operands are provided", () => {
        const operands = Array.from({ length: 101 }, (_, i) =>
          path(`test.attribute.${i}`),
        );
        expect(() => {
          where(path("test.attribute.lhs")).in(...operands);
        }).to.throw();
      });
      it("should work with attribute operands", () => {
        const lhs = "test.attribute.lhs";
        const operands = [
          "test.attribute.operand1",
          "test.attribute.operand2",
          "test.attribute.operand3",
        ];
        const { match, names } = conditionMatch({
          condition: where(path(lhs)).in(...operands.map((op) => path(op))),
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).in(...operands.map((op) => value(op))),
          matcher: /(#\S+)\s+IN\s+\((:\S+),(:\S+),(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(operand1Substitution).to.equal(values.substitute(operands[0]));
        expect(operand2Substitution).to.equal(values.substitute(operands[1]));
        expect(operand3Substitution).to.equal(values.substitute(operands[2]));
      });
    });
    describe("lowerThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = conditionMatch({
          condition: where(path(lhs)).lt(path(rhs)),
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).lt(value(rhs)),
          matcher: /(#\S+)\s*<\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("lowerThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = conditionMatch({
          condition: where(path(lhs)).lte(path(rhs)),
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).lte(value(rhs)),
          matcher: /(#\S+)\s*<=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("notEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = conditionMatch({
          condition: where(path(lhs)).ne(path(rhs)),
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
        const { match, names, values } = conditionMatch({
          condition: where(path(lhs)).ne(value(rhs)),
          matcher: /(#\S+)\s*<>\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("notExists", () => {
      it("should work", () => {
        const attribute = "test.attribute";
        const { match, names } = conditionMatch({
          condition: where(path(attribute)).notExists(),
          matcher: /attribute_not_exists\((#.+)\)/,
        });
        const substitution = match[1];
        expect(substitution).to.equal(names.substitute(attribute));
      });
    });
    describe("type", () => {
      it("should work with string type", () => {
        const name = "test.attribute";
        const type = "S";
        const { match, names, values } = conditionMatch({
          condition: where(path(name)).isType(value(type)),
          matcher: /attribute_type\((#.+),\s*(:.+)\)/,
        });
        const substitution = match[1];
        const reference = match[2];
        expect(substitution).to.equal(names.substitute(name));
        expect(reference).to.equal(values.substitute(type));
      });
    });
  });
  describe(ValueOperand.name, () => {
    describe("beginsWith", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).beginsWith(path(rhs)),
          matcher: /begins_with\((:\S+),\s*(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).beginsWith(value(rhs)),
          matcher: /begins_with\((:\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("between", () => {
      it("should work with attribute bounds", () => {
        const lhs = "I am a value";
        const lower = "test.attribute.lower";
        const upper = "test.attribute.upper";
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).between(path(lower), path(upper)),
          matcher: /(:\S+)\s+BETWEEN\s+(#\S+)\s+AND\s+(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(lowerSubstitution).to.equal(names.substitute(lower));
        expect(upperSubstitution).to.equal(names.substitute(upper));
      });
      it("should work with value bounds", () => {
        const lhs = "I am a value";
        const lower = "I am a also value";
        const upper = "Geezus Louizus we're all values!";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).between(value(lower), value(upper)),
          matcher: /(:\S+)\s+BETWEEN\s+(:\S+)\s+AND\s+(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const lowerSubstitution = match[2];
        const upperSubstitution = match[3];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(lowerSubstitution).to.equal(values.substitute(lower));
        expect(upperSubstitution).to.equal(values.substitute(upper));
      });
    });
    describe("contains", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).contains(path(rhs)),
          matcher: /contains\((:\S+),\s*(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).contains(value(rhs)),
          matcher: /contains\((:\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("equals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).eq(path(rhs)),
          matcher: /(:\S+)\s*=\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).eq(value(rhs)),
          matcher: /(:\S+)\s*=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
      it("should work with size rhs", () => {
        const lhs = "I am a value";
        const rhs = "I contain things";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).eq(size(value(rhs))),
          matcher: /(:\S+)\s*=\s*size\((:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("greaterThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).gt(path(rhs)),
          matcher: /(:\S+)\s*>\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).gt(value(rhs)),
          matcher: /(:\S+)\s*>\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("greaterThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).gte(path(rhs)),
          matcher: /(:\S+)\s*>=\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).gte(value(rhs)),
          matcher: /(:\S+)\s*>=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("in", () => {
      it("should throw when no operands are provided", () => {
        expect(() => {
          where(value("I am a value")).in();
        }).to.throw();
      });
      it("should throw when more than 100 operands are provided", () => {
        const operands = Array.from({ length: 101 }, (_, i) =>
          value(`I am a value ${i}`),
        );
        expect(() => {
          where(value("I am a value")).in(...operands);
        }).to.throw();
      });
      it("should work with attribute operands", () => {
        const lhs = "I am a value";
        const operands = [
          "test.attribute.operand1",
          "test.attribute.operand2",
          "test.attribute.operand3",
        ];
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).in(...operands.map((op) => path(op))),
          matcher: /(:\S+)\s+IN\s+\((#\S+),(#\S+),(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
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
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).in(...operands.map((op) => value(op))),
          matcher: /(:\S+)\s+IN\s+\((:\S+),(:\S+),(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const operand1Substitution = match[2];
        const operand2Substitution = match[3];
        const operand3Substitution = match[4];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(operand1Substitution).to.equal(values.substitute(operands[0]));
        expect(operand2Substitution).to.equal(values.substitute(operands[1]));
        expect(operand3Substitution).to.equal(values.substitute(operands[2]));
      });
    });
    describe("lowerThan", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).lt(path(rhs)),
          matcher: /(:\S+)\s*<\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).lt(value(rhs)),
          matcher: /(:\S+)\s*<\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("lowerThanOrEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).lte(path(rhs)),
          matcher: /(:\S+)\s*<=\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).lte(value(rhs)),
          matcher: /(:\S+)\s*<=\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
    describe("notEquals", () => {
      it("should work with attribute rhs", () => {
        const lhs = "I am a value";
        const rhs = "test.attribute.rhs";
        const { match, names, values } = conditionMatch({
          condition: where(value(lhs)).ne(path(rhs)),
          matcher: /(:\S+)\s*<>\s*(#\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      it("should work with value rhs", () => {
        const lhs = "I am a value";
        const rhs = "I am also a value";
        const { match, values } = conditionMatch({
          condition: where(value(lhs)).ne(value(rhs)),
          matcher: /(:\S+)\s*<>\s*(:\S+)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
    });
  });
  describe(Condition.name, () => {
    describe("and", () => {
      it("should properly combine two expressions", () => {
        const left = "attr.left";
        const right = "attr.right";
        const leftCondition = where(path(left)).exists();
        const rightCondition = where(path(right)).notExists();
        const { match, names } = conditionMatch({
          condition: leftCondition.and(rightCondition),
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
        const leftCondition = where(path(left)).exists();
        const rightCondition = where(path(right)).notExists();
        const { match, names } = conditionMatch({
          condition: leftCondition.or(rightCondition),
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
      const { match, names } = conditionMatch({
        condition: not(where(path(name)).exists()),
        matcher: /NOT \(attribute_exists\((#.+)\)\)/,
      });
      const substitution = match[1];
      expect(substitution).to.equal(names.substitute(name));
    });
  });
});
