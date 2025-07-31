import { expect } from "@infra-blocks/test";
import { size } from "../../../../../src/commands/expressions/condition/size.js";
import { path, value } from "../../../../../src/index.js";
import { operandMatch } from "../update/action-match.js";

describe("commands.expressions.condition.size", () => {
  describe(size.name, () => {
    it("should not compile with a number value", () => {
      // @ts-expect-error Numbers are not valid operands for size.
      size(value(42));
    });
    it("should not compile with a boolean value", () => {
      // @ts-expect-error Booleans are not valid operands for size.
      size(value(true));
    });
    it("should not compile with a null value", () => {
      // @ts-expect-error Nulls are not valid operands for size.
      size(value(null));
    });
    it("should work with a path", () => {
      const attribute = "test.attribute";
      const { match, names } = operandMatch({
        operand: size(path(attribute)),
        matcher: /size\((#\S+)\)/,
      });
      const substitution = match[1];
      expect(substitution).to.equal(names.substitute(attribute));
    });
    it("should work with a binary value", () => {
      const operand = Buffer.from("bitchass value");
      const { match, values } = operandMatch({
        operand: size(value(operand)),
        matcher: /size\((:\S+)\)/,
      });
      const substitution = match[1];
      expect(substitution).to.equal(values.substitute(operand));
    });
    it("should work with a list value", () => {
      const operand = ["a", "b", "c"];
      const { match, values } = operandMatch({
        operand: size(value(operand)),
        matcher: /size\((:\S+)\)/,
      });
      const substitution = match[1];
      expect(substitution).to.equal(values.substitute(operand));
    });
    it("should work a map value", () => {
      const operand = { a: 1, b: 2 };
      const { match, values } = operandMatch({
        operand: size(value(operand)),
        matcher: /size\((:\S+)\)/,
      });
      const substitution = match[1];
      expect(substitution).to.equal(values.substitute(operand));
    });
    it("should work with a set value", () => {
      const operand = new Set(["a", "b", "c"]);
      const { match, values } = operandMatch({
        operand: size(value(operand)),
        matcher: /size\((:\S+)\)/,
      });
      const substitution = match[1];
      expect(substitution).to.equal(values.substitute(operand));
    });
    it("should work with a string value", () => {
      const operand = "AI is not I but just A";
      const { match, values } = operandMatch({
        operand: size(value(operand)),
        matcher: /size\((:\S+)\)/,
      });
      const substitution = match[1];
      expect(substitution).to.equal(values.substitute(operand));
    });
  });
});
