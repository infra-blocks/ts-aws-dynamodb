import { expect } from "@infra-blocks/test";
import { attributeExists } from "../../../../../src/commands/expressions/functions/attribute-exists.js";
import { attributeNotExists } from "../../../../../src/commands/expressions/functions/attribute-not-exists.js";
import { attributeType } from "../../../../../src/commands/expressions/functions/attribute-type.js";
import { beginsWith } from "../../../../../src/commands/expressions/functions/begins-with.js";
import { contains } from "../../../../../src/commands/expressions/functions/contains.js";
import {
  ATTRIBUTE_TYPES,
  path,
  size,
  value,
} from "../../../../../src/index.js";
import { expressionMatch } from "../lib.js";

describe("commands.expressions.condition.functions", () => {
  describe(attributeExists.name, () => {
    it("should not compile with a value", () => {
      // @ts-expect-error Values are not valid operands for attributeExists.
      attributeExists(value("nope"));
    });
    it("should work with a path", () => {
      const attribute = "test.attribute";
      const { match, names } = expressionMatch({
        expression: attributeExists(path(attribute)),
        matcher: /attribute_exists\((#\S+)\)/,
      });
      const attributeSubstitution = match[1];
      expect(attributeSubstitution).to.equal(names.substitute(attribute));
    });
    it("should work with an implicit path", () => {
      const attribute = "test.attribute";
      const { match, names } = expressionMatch({
        expression: attributeExists(attribute),
        matcher: /attribute_exists\((#\S+)\)/,
      });
      const attributeSubstitution = match[1];
      expect(attributeSubstitution).to.equal(names.substitute(attribute));
    });
  });
  describe(attributeNotExists.name, () => {
    it("should not compile with a value", () => {
      // @ts-expect-error Values are not valid operands for attributeNotExists.
      attributeNotExists(value("nope"));
    });
    it("should work with a path", () => {
      const attribute = "test.attribute";
      const { match, names } = expressionMatch({
        expression: attributeNotExists(path(attribute)),
        matcher: /attribute_not_exists\((#\S+)\)/,
      });
      const attributeSubstitution = match[1];
      expect(attributeSubstitution).to.equal(names.substitute(attribute));
    });
    it("should work with an implicit path", () => {
      const attribute = "test.attribute";
      const { match, names } = expressionMatch({
        expression: attributeNotExists(attribute),
        matcher: /attribute_not_exists\((#\S+)\)/,
      });
      const attributeSubstitution = match[1];
      expect(attributeSubstitution).to.equal(names.substitute(attribute));
    });
  });
  describe(attributeType.name, () => {
    it("should not compile with an lhs value", () => {
      const lhs = "test.attribute";
      // @ts-expect-error Values are not valid lhs operands for attributeType.
      attributeType(value(lhs), value("N"));
    });
    it("should not compile with an rhs value that isn't a NativeType", () => {
      const lhs = "test.attribute";
      const rhs = "a-string-but-not-a-type";
      // @ts-expect-error Only NativeType values are valid rhs operands for attributeType.
      attributeType(path(lhs), value(rhs));
    });
    for (const type of ATTRIBUTE_TYPES) {
      it(`should work with a path and type ${type}`, () => {
        const lhs = "test.attribute";
        const { match, names, values } = expressionMatch({
          expression: attributeType(path(lhs), value(type)),
          matcher: /attribute_type\((#\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(type));
      });
      it(`should work with an implicit path and type ${type}`, () => {
        const lhs = "test.attribute";
        const { match, names, values } = expressionMatch({
          expression: attributeType(lhs, value(type)),
          matcher: /attribute_type\((#\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(type));
      });
      it(`should not compile with an implicit path and an implicit type ${type}`, () => {
        // @ts-expect-error Strings are not valid implicit values for types.
        attributeType("whatever", type);
      });
    }
  });
  describe(beginsWith.name, () => {
    it("should not compile with number values", () => {
      const lhs = 42;
      const rhs = 69;
      // @ts-expect-error Numbers are not valid operands for beginsWith.
      beginsWith(value(lhs), value(rhs));
    });
    it("should not compile with implicit number values", () => {
      // @ts-expect-error Numbers are not valid operands for beginsWith.
      beginsWith(42, 69);
    });
    it("should work with paths", () => {
      const lhs = "test.attribute.lhs";
      const rhs = "test.attribute.rhs";
      const { match, names } = expressionMatch({
        expression: beginsWith(path(lhs), path(rhs)),
        matcher: /begins_with\((#\S+),\s*(#\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(names.substitute(lhs));
      expect(rhsSubstitution).to.equal(names.substitute(rhs));
    });
    it("should work with implicit paths", () => {
      const lhs = "test.attribute.lhs";
      const rhs = "test.attribute.rhs";
      const { match, names } = expressionMatch({
        expression: beginsWith(lhs, rhs),
        matcher: /begins_with\((#\S+),\s*(#\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(names.substitute(lhs));
      expect(rhsSubstitution).to.equal(names.substitute(rhs));
    });
    it("should work with a string value", () => {
      const lhs = "I am a cuntish string";
      const rhs = "I am also a cuntish string";
      const { match, values } = expressionMatch({
        expression: beginsWith(value(lhs), value(rhs)),
        matcher: /begins_with\((:\S+),\s*(:\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(values.substitute(lhs));
      expect(rhsSubstitution).to.equal(values.substitute(rhs));
    });
    it("should work with a binary value", () => {
      const lhs = Buffer.from("I am a cuntish binary");
      const rhs = Buffer.from("I am also a cuntish binary");
      const { match, values } = expressionMatch({
        expression: beginsWith(value(lhs), value(rhs)),
        matcher: /begins_with\((:\S+),\s*(:\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(values.substitute(lhs));
      expect(rhsSubstitution).to.equal(values.substitute(rhs));
    });
    it("should work with an implicit binary value", () => {
      const lhs = Buffer.from("I am a cuntish binary");
      const rhs = Buffer.from("I am also a cuntish binary");
      const { match, values } = expressionMatch({
        expression: beginsWith(lhs, rhs),
        matcher: /begins_with\((:\S+),\s*(:\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(values.substitute(lhs));
      expect(rhsSubstitution).to.equal(values.substitute(rhs));
    });
  });
  describe(contains.name, () => {
    it("should not compile with size as lhs operand", () => {
      expect(() =>
        // @ts-expect-error Size is not a valid lhs operand for contains.
        contains(size(path("test.attribute")), value("test.value")),
      ).to.throw();
    });
    it("should work with paths", () => {
      const lhs = "test.attribute.lhs";
      const rhs = "test.attribute.rhs";
      const { match, names } = expressionMatch({
        expression: contains(path(lhs), path(rhs)),
        matcher: /contains\((#\S+),\s*(#\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(names.substitute(lhs));
      expect(rhsSubstitution).to.equal(names.substitute(rhs));
    });
    it("should work with implicit paths", () => {
      const lhs = "test.attribute.lhs";
      const rhs = "test.attribute.rhs";
      const { match, names } = expressionMatch({
        expression: contains(lhs, rhs),
        matcher: /contains\((#\S+),\s*(#\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(names.substitute(lhs));
      expect(rhsSubstitution).to.equal(names.substitute(rhs));
    });
    it("should work with values", () => {
      const lhs = "I am a cuntish string";
      const rhs = "Maybe I am contained in the previous cuntish string";
      const { match, values } = expressionMatch({
        expression: contains(value(lhs), value(rhs)),
        matcher: /contains\((:\S+),\s*(:\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(values.substitute(lhs));
      expect(rhsSubstitution).to.equal(values.substitute(rhs));
    });
    it("should work with implicit values", () => {
      const lhs = new Set([1, 2, 3]);
      const rhs = 4;
      const { match, values } = expressionMatch({
        expression: contains(lhs, rhs),
        matcher: /contains\((:\S+),\s*(:\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(values.substitute(lhs));
      expect(rhsSubstitution).to.equal(values.substitute(rhs));
    });
    it("should with with size as rhs operand", () => {
      const lhs = "test.attribute.lhs";
      const rhs = "test.attribute.rhs";
      const { match, names } = expressionMatch({
        expression: contains(path(lhs), size(path(rhs))),
        matcher: /contains\((#\S+),\s*size\((#\S+)\)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(names.substitute(lhs));
      expect(rhsSubstitution).to.equal(names.substitute(rhs));
    });
  });
});
