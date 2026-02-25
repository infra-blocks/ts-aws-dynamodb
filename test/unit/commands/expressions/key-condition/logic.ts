import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { KeyCondition } from "../../../../../src/commands/expressions/key-condition/index.js";
import { and, attributeExists, not, or } from "../../../../../src/index.js";
import { matchExpression } from "../lib.js";

export const logicTests = () => {
  suite("logic", () => {
    test("should not compile with 'or'", () => {
      // @ts-expect-error "or" is not allowed in key condition expressions.
      KeyCondition.from(or(["pk", "=", "toto"], ["sk", ">", "tata"]));
    });
    test("should not compile with 'not'", () => {
      // @ts-expect-error "not" is not allowed in key condition expressions.
      KeyCondition.from(not(["pk", "=", "toto"]));
    });
    suite("and", () => {
      test("should not compile with invalid expression", () => {
        // @ts-expect-error "attributeNotExists" is not allowed in key condition expressions.
        KeyCondition.from(and(["pk", "=", "toto"], attributeExists("tutu")));
      });
      test("should work as expected", () => {
        const pkLhs = "test.attribute.lhs";
        const pkRhs = "toto";
        const skLhs = "test.attribute.rhs";
        const skRhs = "tata";
        const { match, names } = matchExpression({
          expression: KeyCondition.from(
            and([pkLhs, "=", pkRhs], [skLhs, "=", skRhs]),
          ),
          matcher: /\((#\S+) = (#\S+) AND (#\S+) = (#\S+)\)/,
        });

        const pkLhsSubstitution = match[1];
        expect(pkLhsSubstitution).to.equal(names.substitute(pkLhs));
        const pkRhsSubstitution = match[2];
        expect(pkRhsSubstitution).to.equal(names.substitute(pkRhs));
        const skLhsSubstitution = match[3];
        expect(skLhsSubstitution).to.equal(names.substitute(skLhs));
        const skRhsSubstitution = match[4];
        expect(skRhsSubstitution).to.equal(names.substitute(skRhs));
      });
    });
  });
};
