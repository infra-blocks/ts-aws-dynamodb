import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { beginsWith, path, value } from "../../../../../src/index.js";
import { matchExpression } from "../lib.js";

export const beginsWithTests = () => {
  suite(beginsWith.name, () => {
    test("should not compile with number values", () => {
      const lhs = 42;
      const rhs = 69;
      // @ts-expect-error Numbers are not valid operands for beginsWith.
      beginsWith(value(lhs), value(rhs));
    });
    test("should not compile with implicit number values", () => {
      // @ts-expect-error Numbers are not valid operands for beginsWith.
      beginsWith(42, 69);
    });
    test("should work with paths", () => {
      const lhs = "test.attribute.lhs";
      const rhs = "test.attribute.rhs";
      const { match, names } = matchExpression({
        expression: beginsWith(path(lhs), path(rhs)),
        matcher: /begins_with\((#\S+),\s*(#\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(names.substitute(lhs));
      expect(rhsSubstitution).to.equal(names.substitute(rhs));
    });
    test("should work with implicit paths", () => {
      const lhs = "test.attribute.lhs";
      const rhs = "test.attribute.rhs";
      const { match, names } = matchExpression({
        expression: beginsWith(lhs, rhs),
        matcher: /begins_with\((#\S+),\s*(#\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(names.substitute(lhs));
      expect(rhsSubstitution).to.equal(names.substitute(rhs));
    });
    test("should work with a string value", () => {
      const lhs = "I am a cuntish string";
      const rhs = "I am also a cuntish string";
      const { match, values } = matchExpression({
        expression: beginsWith(value(lhs), value(rhs)),
        matcher: /begins_with\((:\S+),\s*(:\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(values.substitute(lhs));
      expect(rhsSubstitution).to.equal(values.substitute(rhs));
    });
    test("should work with a binary value", () => {
      const lhs = Buffer.from("I am a cuntish binary");
      const rhs = Buffer.from("I am also a cuntish binary");
      const { match, values } = matchExpression({
        expression: beginsWith(value(lhs), value(rhs)),
        matcher: /begins_with\((:\S+),\s*(:\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(values.substitute(lhs));
      expect(rhsSubstitution).to.equal(values.substitute(rhs));
    });
    test("should work with an implicit binary value", () => {
      const lhs = Buffer.from("I am a cuntish binary");
      const rhs = Buffer.from("I am also a cuntish binary");
      const { match, values } = matchExpression({
        expression: beginsWith(lhs, rhs),
        matcher: /begins_with\((:\S+),\s*(:\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(values.substitute(lhs));
      expect(rhsSubstitution).to.equal(values.substitute(rhs));
    });
  });
};
