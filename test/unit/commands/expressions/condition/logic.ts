import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import {
  and,
  attributeExists,
  attributeNotExists,
  not,
  or,
  path,
  value,
} from "../../../../../src/index.js";
import { matchExpression } from "../lib.js";

// TODO: into its own unit test file, and here should just be to see what is accepted in Conditions.
export const logicTests = () => {
  suite("logic", () => {
    suite("commands.expressions.condition.logic", () => {
      suite(and.name, () => {
        test("should work with two comparisons", () => {
          const lhs = 42;
          const rhs = 69;
          const { match, values } = matchExpression({
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
        test("should work with two functions", () => {
          const attribute = "foo.bar";
          const { match, names } = matchExpression({
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
        test("should work with two logical expressions", () => {
          const lhs = "foo";
          const rhs = "bar";
          const { match, names } = matchExpression({
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
      suite(or.name, () => {
        test("should work with two comparisons", () => {
          const lhs = 42;
          const rhs = 69;
          const { match, values } = matchExpression({
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
        test("should work with two functions", () => {
          const attribute = "foo.bar";
          const { match, names } = matchExpression({
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
        test("should work with two logical expressions", () => {
          const lhs = "foo";
          const rhs = "bar";
          const { match, names } = matchExpression({
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
      suite(not.name, () => {
        test("should work with a comparison", () => {
          const lhs = 42;
          const rhs = 69;
          const { match, values } = matchExpression({
            expression: not([value(lhs), "=", value(rhs)]),
            matcher: /\(NOT\s+(:\S+)\s+=\s+(:\S+)\)/,
          });
          expect(match[1]).to.equal(values.substitute(lhs));
          expect(match[2]).to.equal(values.substitute(rhs));
        });
        test("should work with a function", () => {
          const attribute = "foo.bar";
          const { match, names } = matchExpression({
            expression: not(attributeExists(path(attribute))),
            matcher: /\(NOT\s+attribute_exists\((#\S+)\)\)/,
          });
          expect(match[1]).to.equal(names.substitute(attribute));
        });
        test("should work with a logical expression", () => {
          const lhs = "foo";
          const rhs = "bar";
          const { match, names } = matchExpression({
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
  });
};
