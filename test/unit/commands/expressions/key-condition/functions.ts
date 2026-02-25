import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { attributeExists } from "../../../../../src/commands/expressions/functions/attribute-exists.js";
import { attributeNotExists } from "../../../../../src/commands/expressions/functions/attribute-not-exists.js";
import { attributeType } from "../../../../../src/commands/expressions/functions/attribute-type.js";
import { beginsWith } from "../../../../../src/commands/expressions/functions/begins-with.js";
import { contains } from "../../../../../src/commands/expressions/functions/contains.js";
import { KeyCondition } from "../../../../../src/commands/expressions/key-condition/key-condition.js";
import { path } from "../../../../../src/index.js";
import { matchExpression } from "../lib.js";

export const functionsTests = () => {
  suite("functions", () => {
    test("should not compile with 'attributeExists'", () => {
      // @ts-expect-error "attributeExists" is not allowed in key condition expressions.
      KeyCondition.from(attributeExists("toto"));
    });
    test("should not compile with 'attributeNotExists'", () => {
      // @ts-expect-error "attributeNotExists" is not allowed in key condition expressions.
      KeyCondition.from(attributeNotExists("toto"));
    });
    test("should not compile with 'attributeType'", () => {
      // @ts-expect-error "attributeType" is not allowed in key condition expressions.
      KeyCondition.from(attributeType("toto"));
    });
    test("should not compile with 'contains'", () => {
      // @ts-expect-error "contains" is not allowed in key condition expressions.
      KeyCondition.from(contains("toto", "t"));
    });
    test("should work as expected with 'beginsWith'", () => {
      const lhs = "test.attribute.lhs";
      const rhs = "test.attribute.rhs";
      const { match, names } = matchExpression({
        expression: KeyCondition.from(beginsWith(path(lhs), path(rhs))),
        matcher: /begins_with\((#\S+),\s*(#\S+)\)/,
      });
      const lhsSubstitution = match[1];
      const rhsSubstitution = match[2];
      expect(lhsSubstitution).to.equal(names.substitute(lhs));
      expect(rhsSubstitution).to.equal(names.substitute(rhs));
    });
  });
};
