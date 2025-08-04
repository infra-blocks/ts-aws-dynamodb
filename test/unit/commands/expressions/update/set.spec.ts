import { expect } from "@infra-blocks/test";
import { ifNotExists, path, set, value } from "../../../../../src/index.js";
import { actionMatch } from "./action-match.js";

describe("commands.expressions.update.set", () => {
  describe(set.name, () => {
    it("should work with a path as lhs and a path as rhs", () => {
      const attribute = "attr.path";
      const operand = "attr.operand";
      const { match, names } = actionMatch({
        action: set(path(attribute), path(operand)),
        matcher: /(#\S+)\s+=\s+(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(operand));
    });
    it("should work with an implicit path as lhs and a path as rhs", () => {
      const attribute = "attr.path";
      const operand = "attr.operand";
      const { match, names } = actionMatch({
        action: set(attribute, path(operand)),
        matcher: /(#\S+)\s+=\s+(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(operand));
    });
    it("should work with a value", () => {
      const attribute = "attr.path";
      const operand = 42;
      const { match, names, values } = actionMatch({
        action: set(path(attribute), value(operand)),
        matcher: /(#\S+)\s+=\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(values.substitute(operand));
    });
    it("should work with an if_not_exists operand", () => {
      const attribute = "attr.path";
      const operand = "attr.operand";
      const { match, names } = actionMatch({
        action: set(
          path(attribute),
          ifNotExists(path(attribute), path(operand)),
        ),
        matcher: /(#\S+)\s+=\s+if_not_exists\((#\S+),\s+(#\S+)\)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(attribute));
      expect(match[3]).to.equal(names.substitute(operand));
    });
    it("should be able to add an attribute as part of the assignment", () => {
      const attribute = "attr.path";
      const lhs = "attr.lhs";
      const rhs = "attr.rhs";
      const { match, names } = actionMatch({
        action: set(path(attribute), path(lhs), "+", path(rhs)),
        matcher: /(#\S+)\s+=\s+(#\S+)\s+\+\s+(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(lhs));
      expect(match[3]).to.equal(names.substitute(rhs));
    });
    it("should be able to add a value as part of the assignment", () => {
      const attribute = "attr.path";
      const lhs = "attr.lhs";
      const rhs = 42;
      const { match, names, values } = actionMatch({
        action: set(path(attribute), path(lhs), "+", value(rhs)),
        matcher: /(#\S+)\s+=\s+(#\S+)\s+\+\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(lhs));
      expect(match[3]).to.equal(values.substitute(rhs));
    });
    it("should be able to add an attribute if it exists or a default value otherwise", () => {
      const attribute = "attr.path";
      const lhs = "attr.lhs";
      const rhs = "attr.rhs";
      const defaultValue = 42;
      const { match, names, values } = actionMatch({
        action: set(
          path(attribute),
          path(lhs),
          "+",
          ifNotExists(path(rhs), value(defaultValue)),
        ),
        matcher: /(#\S+)\s+=\s+(#\S+)\s+\+\s+if_not_exists\((#\S+),\s+(:\S+)\)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(lhs));
      expect(match[3]).to.equal(names.substitute(rhs));
      expect(match[4]).to.equal(values.substitute(defaultValue));
    });
    it("should be able to subtract an attribute as part of the assignment", () => {
      const attribute = "attr.path";
      const lhs = "attr.lhs";
      const rhs = "attr.rhs";
      const { match, names } = actionMatch({
        action: set(path(attribute), path(lhs), "-", path(rhs)),
        matcher: /(#\S+)\s+=\s+(#\S+)\s+-\s+(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(lhs));
      expect(match[3]).to.equal(names.substitute(rhs));
    });
    it("should be able to subtract a value as part of the assignment", () => {
      const attribute = "attr.path";
      const lhs = "attr.lhs";
      const rhs = 42;
      const { match, names, values } = actionMatch({
        action: set(path(attribute), path(lhs), "-", value(rhs)),
        matcher: /(#\S+)\s+=\s+(#\S+)\s+-\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(lhs));
      expect(match[3]).to.equal(values.substitute(rhs));
    });
    it("should be able to subtract an attribute if it exists or a default value otherwise", () => {
      const attribute = "attr.path";
      const lhs = "attr.lhs";
      const rhs = "attr.rhs";
      const defaultValue = 42;
      const { match, names, values } = actionMatch({
        action: set(
          path(attribute),
          path(lhs),
          "-",
          ifNotExists(path(rhs), value(defaultValue)),
        ),
        matcher: /(#\S+)\s+=\s+(#\S+)\s+-\s+if_not_exists\((#\S+),\s+(:\S+)\)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(lhs));
      expect(match[3]).to.equal(names.substitute(rhs));
      expect(match[4]).to.equal(values.substitute(defaultValue));
    });
  });
});
