import { expect } from "@infra-blocks/test";
import {
  attributeExists,
  attributeNotExists,
} from "../../../../../src/commands/expressions/condition/functions.js";
import {
  and,
  not,
  or,
} from "../../../../../src/commands/expressions/condition/logic.js";
import { path, value } from "../../../../../src/index.js";
import { expressionMatch } from "../update/action-match.js";

describe("commands.expressions.condition.logic", () => {
  describe(and.name, () => {
    it("should work with two comparisons", () => {
      const lhs = 42;
      const rhs = 69;
      const { match, values } = expressionMatch({
        expression: and(
          [value(lhs), "=", value(rhs)],
          [value(lhs), ">", value(rhs)],
        ),
        matcher: /\((:\S+)\s+=\s+(:\S+)\s+AND\s+(:\S+)\s+>\s+(:\S+)\)/,
      });
      expect(match[1]).to.equal(values.substitute(lhs));
      expect(match[2]).to.equal(values.substitute(rhs));
      expect(match[3]).to.equal(values.substitute(lhs));
      expect(match[4]).to.equal(values.substitute(rhs));
    });
    it("should work with two functions", () => {
      const attribute = "foo.bar";
      const { match, names } = expressionMatch({
        // Obviously returns true.
        expression: and(
          attributeExists(path(attribute)),
          attributeNotExists(path(attribute)),
        ),
        matcher:
          /\(attribute_exists\((#\S+)\)\s+AND\s+attribute_not_exists\((#\S+)\)\)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(attribute));
    });
    it("should work with two logical expressions", () => {
      const lhs = "foo";
      const rhs = "bar";
      const { match, names } = expressionMatch({
        expression: and(
          and(attributeExists(path(lhs)), attributeNotExists(path(rhs))),
          and(attributeExists(path(lhs)), attributeNotExists(path(rhs))),
        ),
        matcher:
          /\(\(attribute_exists\((#\S+)\)\s+AND\s+attribute_not_exists\((#\S+)\)\)\s+AND\s+\(attribute_exists\((#\S+)\)\s+AND\s+attribute_not_exists\((#\S+)\)\)\)/,
      });
      expect(match[1]).to.equal(names.substitute(lhs));
      expect(match[2]).to.equal(names.substitute(rhs));
      expect(match[3]).to.equal(names.substitute(lhs));
      expect(match[4]).to.equal(names.substitute(rhs));
    });
  });
  describe(or.name, () => {
    it("should work with two comparisons", () => {
      const lhs = 42;
      const rhs = 69;
      const { match, values } = expressionMatch({
        expression: or(
          [value(lhs), "=", value(rhs)],
          [value(lhs), ">", value(rhs)],
        ),
        matcher: /\((:\S+)\s+=\s+(:\S+)\s+OR\s+(:\S+)\s+>\s+(:\S+)\)/,
      });
      expect(match[1]).to.equal(values.substitute(lhs));
      expect(match[2]).to.equal(values.substitute(rhs));
      expect(match[3]).to.equal(values.substitute(lhs));
      expect(match[4]).to.equal(values.substitute(rhs));
    });
    it("should work with two functions", () => {
      const attribute = "foo.bar";
      const { match, names } = expressionMatch({
        expression: or(
          attributeExists(path(attribute)),
          attributeNotExists(path(attribute)),
        ),
        matcher:
          /\(attribute_exists\((#\S+)\)\s+OR\s+attribute_not_exists\((#\S+)\)\)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(attribute));
    });
    it("should work with two logical expressions", () => {
      const lhs = "foo";
      const rhs = "bar";
      const { match, names } = expressionMatch({
        expression: or(
          or(attributeExists(path(lhs)), attributeNotExists(path(rhs))),
          or(attributeExists(path(lhs)), attributeNotExists(path(rhs))),
        ),
        matcher:
          /\(\(attribute_exists\((#\S+)\)\s+OR\s+attribute_not_exists\((#\S+)\)\)\s+OR\s+\(attribute_exists\((#\S+)\)\s+OR\s+attribute_not_exists\((#\S+)\)\)\)/,
      });
      expect(match[1]).to.equal(names.substitute(lhs));
      expect(match[2]).to.equal(names.substitute(rhs));
      expect(match[3]).to.equal(names.substitute(lhs));
      expect(match[4]).to.equal(names.substitute(rhs));
    });
  });
  describe(not.name, () => {
    it("should work with a comparison", () => {
      const lhs = 42;
      const rhs = 69;
      const { match, values } = expressionMatch({
        expression: not([value(lhs), "=", value(rhs)]),
        matcher: /\(NOT\s+(:\S+)\s+=\s+(:\S+)\)/,
      });
      expect(match[1]).to.equal(values.substitute(lhs));
      expect(match[2]).to.equal(values.substitute(rhs));
    });
    it("should work with a function", () => {
      const attribute = "foo.bar";
      const { match, names } = expressionMatch({
        expression: not(attributeExists(path(attribute))),
        matcher: /\(NOT\s+attribute_exists\((#\S+)\)\)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
    });
    it("should work with a logical expression", () => {
      const lhs = "foo";
      const rhs = "bar";
      const { match, names } = expressionMatch({
        expression: not(
          and(attributeExists(path(lhs)), attributeNotExists(path(rhs))),
        ),
        matcher:
          /\(NOT\s+\(attribute_exists\((#\S+)\)\s+AND\s+attribute_not_exists\((#\S+)\)\)\)/,
      });
      expect(match[1]).to.equal(names.substitute(lhs));
      expect(match[2]).to.equal(names.substitute(rhs));
    });
  });
});
