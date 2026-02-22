import { expect } from "@infra-blocks/test";
import { Projection } from "../../../../src/commands/expressions/index.js";
import { literal, path } from "../../../../src/index.js";
import { expressionMatch } from "./lib.js";

describe("commands.expressions.projection", () => {
  describe("ProjectionExpression", () => {
    it("should not compile with a type other than a raw path", () => {
      // @ts-expect-error A string is not a valid rhs operand for add.
      Projection.from([42]);
    });
    it("should throw for empty input", () => {
      expect(() => Projection.from([])).to.throw();
    });
    it("should work with an implicit path", () => {
      const { match, names } = expressionMatch({
        expression: Projection.from(["toto"]),
        matcher: /(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("toto"));
    });
    it("should work with an explicit path", () => {
      const { match, names } = expressionMatch({
        expression: Projection.from([path("toto")]),
        matcher: /(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("toto"));
    });
    it("should work with a path literal", () => {
      const { match, names } = expressionMatch({
        expression: Projection.from([literal("toto")]),
        matcher: /(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("toto"));
    });
    it("should allow for mixed bag of raw paths", () => {
      const { match, names } = expressionMatch({
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
});
