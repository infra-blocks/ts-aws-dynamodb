import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { KeyConditionComparison } from "../../../../../src/commands/expressions/key-condition/index.js";
import { path, size, value } from "../../../../../src/index.js";
import { matchExpression } from "../lib.js";

export const comparisonsTests = () => {
  suite("comparisons", () => {
    suite("KeyConditionComparison", () => {
      test("should not compile with 'in'", () => {
        expect(() =>
          // @ts-expect-error "IN" operator is not allowed in key condition expressions.
          KeyConditionComparison.from(["hello", "IN", [value(1), value(2)]]),
        ).to.throw();
      });
      test("should not compile with '<>'", () => {
        expect(() =>
          // @ts-expect-error "<>" operator is not allowed in key condition expressions.
          KeyConditionComparison.from(["hello", "<>", value(1)]),
        ).to.throw();
      });

      // Key condition comparisons are made on key attributes. Key attributes satisfy the minimum requirements
      // for all operators. However, not all operators are supported by the API.
      const operators = ["=", ">", ">=", "<", "<="] as const;
      for (const operator of operators) {
        suite(operator, () => {
          test("should not compile with size operands", () => {
            // @ts-expect-error size is not a valid operand for key condition expressions.
            KeyConditionComparison.from([size("hello"), operator, size("bye")]);
          });
          test("should not compile with array values", () => {
            const lhs = ["hello", "bye"];
            const rhs = ["fuck", "off"];
            // @ts-expect-error Arrays are not comparable.
            KeyConditionComparison.from([value(lhs), operator, value(rhs)]);
          });
          test("should not compile with array implicit values", () => {
            const lhs = ["hello", "bye"];
            const rhs = ["fuck", "off"];
            // @ts-expect-error Arrays are not comparable.
            KeyConditionComparison.from([lhs, operator, rhs]);
          });
          test("should not compile with object values", () => {
            const lhs = { hello: "world" };
            const rhs = { fuck: "off" };
            // @ts-expect-error Objects are not comparable.
            KeyConditionComparison.from([value(lhs), operator, value(rhs)]);
          });
          test("should not compile with implicit object values", () => {
            const lhs = { hello: "world" };
            const rhs = { fuck: "off" };
            // @ts-expect-error Objects are not comparable.
            KeyConditionComparison.from([lhs, operator, rhs]);
          });
          test("should not compile with set values", () => {
            const lhs = new Set(["hello", "bye"]);
            const rhs = new Set(["fuck", "off"]);
            // @ts-expect-error Sets are not comparable.
            KeyConditionComparison.from([value(lhs), operator, value(rhs)]);
          });
          test("should not compile with implicit set values", () => {
            const lhs = new Set(["hello", "bye"]);
            const rhs = new Set(["fuck", "off"]);
            // @ts-expect-error Sets are not comparable.
            KeyConditionComparison.from([lhs, operator, rhs]);
          });
          test("should work with paths", () => {
            const lhs = "toto.tata";
            const rhs = "toto.titi";
            const { match, names } = matchExpression({
              expression: KeyConditionComparison.from([
                path(lhs),
                operator,
                path(rhs),
              ]),
              matcher: new RegExp(`(#\\S+)\\s+${operator}\\s+(#\\S+)`),
            });
            expect(match[1]).to.equal(names.substitute(lhs));
            expect(match[2]).to.equal(names.substitute(rhs));
          });
          test("should work with implicit paths", () => {
            const lhs = "toto.tata";
            const rhs = "toto.titi";
            const { match, names } = matchExpression({
              expression: KeyConditionComparison.from([lhs, operator, rhs]),
              matcher: new RegExp(`(#\\S+)\\s+${operator}\\s+(#\\S+)`),
            });
            expect(match[1]).to.equal(names.substitute(lhs));
            expect(match[2]).to.equal(names.substitute(rhs));
          });
          test("should work with binary values", () => {
            const lhs = Buffer.from("hello");
            const rhs = Buffer.from("bye");
            const { match, values } = matchExpression({
              expression: KeyConditionComparison.from([
                value(lhs),
                operator,
                value(rhs),
              ]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          test("should work with implicit binary values", () => {
            const lhs = Buffer.from("hello");
            const rhs = Buffer.from("bye");
            const { match, values } = matchExpression({
              expression: KeyConditionComparison.from([lhs, operator, rhs]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          test("should work with number values", () => {
            const lhs = 42;
            const rhs = 43;
            const { match, values } = matchExpression({
              expression: KeyConditionComparison.from([
                value(lhs),
                operator,
                value(rhs),
              ]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          test("should work with implicit number values", () => {
            const lhs = 42;
            const rhs = 43;
            const { match, values } = matchExpression({
              expression: KeyConditionComparison.from([lhs, operator, rhs]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          test("should work with string values", () => {
            const lhs = "hello";
            const rhs = "bye";
            const { match, values } = matchExpression({
              expression: KeyConditionComparison.from([
                value(lhs),
                operator,
                value(rhs),
              ]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
        });
      }
    });
    suite("between", () => {
      test("should not compile with size", () => {
        const lhs = "toto.tata";
        const lower = "toto.titi";
        const upper = "toto.tutu";
        KeyConditionComparison.from([
          // @ts-expect-error size is not a valid operator in key condition expressions.
          size(lhs),
          "BETWEEN",
          // @ts-expect-error size is not a valid operator in key condition expressions.
          size(lower),
          "AND",
          // @ts-expect-error size is not a valid operator in key condition expressions.
          size(upper),
        ]);
      });
      test("should work with paths", () => {
        const lhs = "toto.tata";
        const lower = "toto.titi";
        const upper = "toto.tutu";
        const { match, names } = matchExpression({
          expression: KeyConditionComparison.from([
            path(lhs),
            "BETWEEN",
            path(lower),
            "AND",
            path(upper),
          ]),
          matcher: /(#\S+)\s+BETWEEN\s+(#\S+)\s+AND\s+(#\S+)/,
        });
        expect(match[1]).to.equal(names.substitute(lhs));
        expect(match[2]).to.equal(names.substitute(lower));
        expect(match[3]).to.equal(names.substitute(upper));
      });
      test("should work with implicit paths", () => {
        const lhs = "toto.tata";
        const lower = "toto.titi";
        const upper = "toto.tutu";
        const { match, names } = matchExpression({
          expression: KeyConditionComparison.from([
            lhs,
            "BETWEEN",
            lower,
            "AND",
            upper,
          ]),
          matcher: /(#\S+)\s+BETWEEN\s+(#\S+)\s+AND\s+(#\S+)/,
        });
        expect(match[1]).to.equal(names.substitute(lhs));
        expect(match[2]).to.equal(names.substitute(lower));
        expect(match[3]).to.equal(names.substitute(upper));
      });
      test("should work with number values", () => {
        const lhs = 42;
        const lower = 0;
        const upper = 100;
        const { match, values } = matchExpression({
          expression: KeyConditionComparison.from([
            value(lhs),
            "BETWEEN",
            value(lower),
            "AND",
            value(upper),
          ]),
          matcher: /(:\S+)\s+BETWEEN\s+(:\S+)\s+AND\s+(:\S+)/,
        });
        expect(match[1]).to.equal(values.substitute(lhs));
        expect(match[2]).to.equal(values.substitute(lower));
        expect(match[3]).to.equal(values.substitute(upper));
      });
      test("should work with implicit number values", () => {
        const lhs = 42;
        const lower = 0;
        const upper = 100;
        const { match, values } = matchExpression({
          expression: KeyConditionComparison.from([
            lhs,
            "BETWEEN",
            lower,
            "AND",
            upper,
          ]),
          matcher: /(:\S+)\s+BETWEEN\s+(:\S+)\s+AND\s+(:\S+)/,
        });
        expect(match[1]).to.equal(values.substitute(lhs));
        expect(match[2]).to.equal(values.substitute(lower));
        expect(match[3]).to.equal(values.substitute(upper));
      });
    });
  });
};
