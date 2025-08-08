import { expect } from "@infra-blocks/test";
import { comparison } from "../../../../../src/commands/expressions/condition/comparisons.js";
import { path, value } from "../../../../../src/index.js";
import { expressionMatch } from "../update/action-match.js";

describe("commands.expressions.condition.comparisons", () => {
  describe(comparison.name, () => {
    describe("equality operators", () => {
      // Those support all data types.
      const operators = ["=", "<>"] as const;

      for (const operator of operators) {
        describe(operator, () => {
          it("should work with paths", () => {
            const lhs = "toto.tata";
            const rhs = "toto.titi";
            const { match, names } = expressionMatch({
              expression: comparison([path(lhs), operator, path(rhs)]),
              matcher: new RegExp(`(#\\S+)\\s+${operator}\\s+(#\\S+)`),
            });
            expect(match[1]).to.equal(names.substitute(lhs));
            expect(match[2]).to.equal(names.substitute(rhs));
          });
          it("should work with implicit paths", () => {
            const lhs = "toto.tata";
            const rhs = "toto.titi";
            const { match, names } = expressionMatch({
              expression: comparison([lhs, operator, rhs]),
              matcher: new RegExp(`(#\\S+)\\s+${operator}\\s+(#\\S+)`),
            });
            expect(match[1]).to.equal(names.substitute(lhs));
            expect(match[2]).to.equal(names.substitute(rhs));
          });
          it("should work with binary values", () => {
            const lhs = Buffer.from("hello");
            const rhs = Buffer.from("bye");
            const { match, values } = expressionMatch({
              expression: comparison([value(lhs), operator, value(rhs)]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with implicit binary values", () => {
            const lhs = Buffer.from("hello");
            const rhs = Buffer.from("bye");
            const { match, values } = expressionMatch({
              expression: comparison([lhs, operator, rhs]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with number values", () => {
            const lhs = 42;
            const rhs = 43;
            const { match, values } = expressionMatch({
              expression: comparison([value(lhs), operator, value(rhs)]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with implicit number values", () => {
            const lhs = 42;
            const rhs = 43;
            const { match, values } = expressionMatch({
              expression: comparison([lhs, operator, rhs]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with string values", () => {
            const lhs = "hello";
            const rhs = "bye";
            const { match, values } = expressionMatch({
              expression: comparison([value(lhs), operator, value(rhs)]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with array values", () => {
            const lhs = ["hello", "bye"];
            const rhs = ["fuck", "off"];
            const { match, values } = expressionMatch({
              expression: comparison([value(lhs), operator, value(rhs)]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with implicit array values", () => {
            const lhs = ["hello", "bye"];
            const rhs = ["fuck", "off"];
            const { match, values } = expressionMatch({
              expression: comparison([lhs, operator, rhs]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with object values", () => {
            const lhs = { hello: "world" };
            const rhs = { fuck: "off" };
            const { match, values } = expressionMatch({
              expression: comparison([value(lhs), operator, value(rhs)]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with implicit object values", () => {
            const lhs = { hello: "world" };
            const rhs = { fuck: "off" };
            const { match, values } = expressionMatch({
              expression: comparison([lhs, operator, rhs]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with set values", () => {
            const lhs = new Set(["hello", "bye"]);
            const rhs = new Set(["fuck", "off"]);
            const { match, values } = expressionMatch({
              expression: comparison([value(lhs), operator, value(rhs)]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with implicit set values", () => {
            const lhs = new Set(["hello", "bye"]);
            const rhs = new Set(["fuck", "off"]);
            const { match, values } = expressionMatch({
              expression: comparison([lhs, operator, rhs]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
        });
      }
    });
    describe("comparison operators", () => {
      // Those only support "comparable" types: numbers, strings, and binary.
      const operators = [">", ">=", "<", "<="] as const;

      for (const operator of operators) {
        describe(operator, () => {
          it("should not compile with array values", () => {
            const lhs = ["hello", "bye"];
            const rhs = ["fuck", "off"];
            // @ts-expect-error Arrays are not comparable.
            comparison([value(lhs), operator, value(rhs)]);
          });
          it("should not compile with array implicit values", () => {
            const lhs = ["hello", "bye"];
            const rhs = ["fuck", "off"];
            // @ts-expect-error Arrays are not comparable.
            comparison([lhs, operator, rhs]);
          });
          it("should not compile with object values", () => {
            const lhs = { hello: "world" };
            const rhs = { fuck: "off" };
            // @ts-expect-error Objects are not comparable.
            comparison([value(lhs), operator, value(rhs)]);
          });
          it("should not compile with implicit object values", () => {
            const lhs = { hello: "world" };
            const rhs = { fuck: "off" };
            // @ts-expect-error Objects are not comparable.
            comparison([lhs, operator, rhs]);
          });
          it("should not compile with set values", () => {
            const lhs = new Set(["hello", "bye"]);
            const rhs = new Set(["fuck", "off"]);
            // @ts-expect-error Sets are not comparable.
            comparison([value(lhs), operator, value(rhs)]);
          });
          it("should not compile with implicit set values", () => {
            const lhs = new Set(["hello", "bye"]);
            const rhs = new Set(["fuck", "off"]);
            // @ts-expect-error Sets are not comparable.
            comparison([lhs, operator, rhs]);
          });
          it("should work with paths", () => {
            const lhs = "toto.tata";
            const rhs = "toto.titi";
            const { match, names } = expressionMatch({
              expression: comparison([path(lhs), operator, path(rhs)]),
              matcher: new RegExp(`(#\\S+)\\s+${operator}\\s+(#\\S+)`),
            });
            expect(match[1]).to.equal(names.substitute(lhs));
            expect(match[2]).to.equal(names.substitute(rhs));
          });
          it("should work with implicit paths", () => {
            const lhs = "toto.tata";
            const rhs = "toto.titi";
            const { match, names } = expressionMatch({
              expression: comparison([lhs, operator, rhs]),
              matcher: new RegExp(`(#\\S+)\\s+${operator}\\s+(#\\S+)`),
            });
            expect(match[1]).to.equal(names.substitute(lhs));
            expect(match[2]).to.equal(names.substitute(rhs));
          });
          it("should work with binary values", () => {
            const lhs = Buffer.from("hello");
            const rhs = Buffer.from("bye");
            const { match, values } = expressionMatch({
              expression: comparison([value(lhs), operator, value(rhs)]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with implicit binary values", () => {
            const lhs = Buffer.from("hello");
            const rhs = Buffer.from("bye");
            const { match, values } = expressionMatch({
              expression: comparison([lhs, operator, rhs]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with number values", () => {
            const lhs = 42;
            const rhs = 43;
            const { match, values } = expressionMatch({
              expression: comparison([value(lhs), operator, value(rhs)]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with implicit number values", () => {
            const lhs = 42;
            const rhs = 43;
            const { match, values } = expressionMatch({
              expression: comparison([lhs, operator, rhs]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
          it("should work with string values", () => {
            const lhs = "hello";
            const rhs = "bye";
            const { match, values } = expressionMatch({
              expression: comparison([value(lhs), operator, value(rhs)]),
              matcher: new RegExp(`(:\\S+)\\s+${operator}\\s+(:\\S+)`),
            });
            expect(match[1]).to.equal(values.substitute(lhs));
            expect(match[2]).to.equal(values.substitute(rhs));
          });
        });
      }
    });
    describe("between", () => {
      it("should work with paths", () => {
        const lhs = "toto.tata";
        const lower = "toto.titi";
        const upper = "toto.tutu";
        const { match, names } = expressionMatch({
          expression: comparison([
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
      it("should work with implicit paths", () => {
        const lhs = "toto.tata";
        const lower = "toto.titi";
        const upper = "toto.tutu";
        const { match, names } = expressionMatch({
          expression: comparison([lhs, "BETWEEN", lower, "AND", upper]),
          matcher: /(#\S+)\s+BETWEEN\s+(#\S+)\s+AND\s+(#\S+)/,
        });
        expect(match[1]).to.equal(names.substitute(lhs));
        expect(match[2]).to.equal(names.substitute(lower));
        expect(match[3]).to.equal(names.substitute(upper));
      });
      it("should work with number values", () => {
        const lhs = 42;
        const lower = 0;
        const upper = 100;
        const { match, values } = expressionMatch({
          expression: comparison([
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
      it("should work with implicit number values", () => {
        const lhs = 42;
        const lower = 0;
        const upper = 100;
        const { match, values } = expressionMatch({
          expression: comparison([lhs, "BETWEEN", lower, "AND", upper]),
          matcher: /(:\S+)\s+BETWEEN\s+(:\S+)\s+AND\s+(:\S+)/,
        });
        expect(match[1]).to.equal(values.substitute(lhs));
        expect(match[2]).to.equal(values.substitute(lower));
        expect(match[3]).to.equal(values.substitute(upper));
      });
    });
    describe("in", () => {
      it("should throw if containement values are empty", () => {
        expect(() => {
          comparison([path("does.not.matter"), "IN", []]);
        }).to.throw();
      });
      it("should throw if containement values exceed 100", () => {
        expect(() => {
          comparison([
            path("does.not.matter"),
            "IN",
            Array.from({ length: 101 }, (_, i) => path(`value${i}`)),
          ]);
        }).to.throw();
      });
      it("should work with paths", () => {
        const lhs = "toto.tata";
        const values = ["toto.titi", "toto.tutu"];
        const { match, names } = expressionMatch({
          expression: comparison([path(lhs), "IN", values.map((v) => path(v))]),
          matcher: /(#\S+)\s+IN\s+\((#\S+),(#\S+)\)/,
        });
        expect(match[1]).to.equal(names.substitute(lhs));
        expect(match[2]).to.equal(names.substitute(values[0]));
        expect(match[3]).to.equal(names.substitute(values[1]));
      });
      it("should work with implicit paths", () => {
        const lhs = "toto.tata";
        const values = ["toto.titi", "toto.tutu"];
        const { match, names } = expressionMatch({
          expression: comparison([lhs, "IN", values]),
          matcher: /(#\S+)\s+IN\s+\((#\S+),(#\S+)\)/,
        });
        expect(match[1]).to.equal(names.substitute(lhs));
        expect(match[2]).to.equal(names.substitute(values[0]));
        expect(match[3]).to.equal(names.substitute(values[1]));
      });
      it("should work with number values", () => {
        const lhs = 42;
        const values = [0, 100];
        const { match, values: vals } = expressionMatch({
          expression: comparison([
            value(lhs),
            "IN",
            values.map((v) => value(v)),
          ]),
          matcher: /(:\S+)\s+IN\s+\((:\S+),(:\S+)\)/,
        });
        expect(match[1]).to.equal(vals.substitute(lhs));
        expect(match[2]).to.equal(vals.substitute(values[0]));
        expect(match[3]).to.equal(vals.substitute(values[1]));
      });
      it("should work with implicit number values", () => {
        const lhs = 42;
        const values = [0, 100];
        const { match, values: vals } = expressionMatch({
          expression: comparison([lhs, "IN", values]),
          matcher: /(:\S+)\s+IN\s+\((:\S+),(:\S+)\)/,
        });
        expect(match[1]).to.equal(vals.substitute(lhs));
        expect(match[2]).to.equal(vals.substitute(values[0]));
        expect(match[3]).to.equal(vals.substitute(values[1]));
      });
    });
  });
});
