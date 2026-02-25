import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { Projection } from "../../../../src/commands/expressions/index.js";
import { literal, path } from "../../../../src/index.js";
import { matchExpression } from "./lib.js";

export const projectionTests = () => {
  suite("projection", () => {
    test("should not compile with a type other than a path input", () => {
      // @ts-expect-error A string is not a valid rhs operand for add.
      Projection.from([42]);
    });
    test("should throw for empty input", () => {
      expect(() => Projection.from([])).to.throw();
    });
    test("should work with an implicit path", () => {
      const { match, names } = matchExpression({
        expression: Projection.from(["toto"]),
        matcher: /(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("toto"));
    });
    test("should work with an explicit path", () => {
      const { match, names } = matchExpression({
        expression: Projection.from([path("toto")]),
        matcher: /(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("toto"));
    });
    test("should work with a path literal", () => {
      const { match, names } = matchExpression({
        expression: Projection.from([literal("toto")]),
        matcher: /(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("toto"));
    });
    test("should allow for mixed bag of path inputs", () => {
      const { match, names } = matchExpression({
        expression: Projection.from([
          "joe.cunt",
          path("myList[5]"),
          literal("joe.cunt"),
        ]),
        matcher: /(#\S+),(#\S+),(#\S+)/,
      });
      expect(match[1]).to.equal(
        `${names.substitute("joe")}.${names.substitute("cunt")}`,
      );
      expect(match[2]).to.equal(`${names.substitute("myList")}[5]`);
      expect(match[3]).to.equal(
        names.substitute("joe.cunt", { literal: true }),
      );
    });
  });
};
