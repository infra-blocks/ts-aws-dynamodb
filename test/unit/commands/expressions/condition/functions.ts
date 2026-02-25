import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { attributeExists } from "../../../../../src/commands/expressions/functions/attribute-exists.js";
import { attributeNotExists } from "../../../../../src/commands/expressions/functions/attribute-not-exists.js";
import { attributeType } from "../../../../../src/commands/expressions/functions/attribute-type.js";
import { beginsWith } from "../../../../../src/commands/expressions/functions/begins-with.js";
import { contains } from "../../../../../src/commands/expressions/functions/contains.js";
import {
  ATTRIBUTE_TYPES,
  path,
  size,
  value,
} from "../../../../../src/index.js";
import { matchExpression } from "../lib.js";

// TODO: move to their own tests, this module here should only assert that they can
// be used in Conditions.
export const functionsTests = () => {
  suite("functions", () => {
    suite(attributeExists.name, () => {
      test("should not compile with a value", () => {
        // @ts-expect-error Values are not valid operands for attributeExists.
        attributeExists(value("nope"));
      });
      test("should work with a path", () => {
        const attribute = "test.attribute";
        const { match, names } = matchExpression({
          expression: attributeExists(path(attribute)),
          matcher: /attribute_exists\((#\S+)\)/,
        });
        const attributeSubstitution = match[1];
        expect(attributeSubstitution).to.equal(names.substitute(attribute));
      });
      test("should work with an implicit path", () => {
        const attribute = "test.attribute";
        const { match, names } = matchExpression({
          expression: attributeExists(attribute),
          matcher: /attribute_exists\((#\S+)\)/,
        });
        const attributeSubstitution = match[1];
        expect(attributeSubstitution).to.equal(names.substitute(attribute));
      });
    });
    suite(attributeNotExists.name, () => {
      test("should not compile with a value", () => {
        // @ts-expect-error Values are not valid operands for attributeNotExists.
        attributeNotExists(value("nope"));
      });
      test("should work with a path", () => {
        const attribute = "test.attribute";
        const { match, names } = matchExpression({
          expression: attributeNotExists(path(attribute)),
          matcher: /attribute_not_exists\((#\S+)\)/,
        });
        const attributeSubstitution = match[1];
        expect(attributeSubstitution).to.equal(names.substitute(attribute));
      });
      test("should work with an implicit path", () => {
        const attribute = "test.attribute";
        const { match, names } = matchExpression({
          expression: attributeNotExists(attribute),
          matcher: /attribute_not_exists\((#\S+)\)/,
        });
        const attributeSubstitution = match[1];
        expect(attributeSubstitution).to.equal(names.substitute(attribute));
      });
    });
    suite(attributeType.name, () => {
      test("should not compile with an lhs value", () => {
        const lhs = "test.attribute";
        // @ts-expect-error Values are not valid lhs operands for attributeType.
        attributeType(value(lhs), value("N"));
      });
      test("should not compile with an rhs value that isn't a NativeType", () => {
        const lhs = "test.attribute";
        const rhs = "a-string-but-not-a-type";
        // @ts-expect-error Only NativeType values are valid rhs operands for attributeType.
        attributeType(path(lhs), value(rhs));
      });
      for (const type of ATTRIBUTE_TYPES) {
        test(`should work with a path and type ${type}`, () => {
          const lhs = "test.attribute";
          const { match, names, values } = matchExpression({
            expression: attributeType(path(lhs), value(type)),
            matcher: /attribute_type\((#\S+),\s*(:\S+)\)/,
          });
          const lhsSubstitution = match[1];
          const rhsSubstitution = match[2];
          expect(lhsSubstitution).to.equal(names.substitute(lhs));
          expect(rhsSubstitution).to.equal(values.substitute(type));
        });
        test(`should work with an implicit path and type ${type}`, () => {
          const lhs = "test.attribute";
          const { match, names, values } = matchExpression({
            expression: attributeType(lhs, value(type)),
            matcher: /attribute_type\((#\S+),\s*(:\S+)\)/,
          });
          const lhsSubstitution = match[1];
          const rhsSubstitution = match[2];
          expect(lhsSubstitution).to.equal(names.substitute(lhs));
          expect(rhsSubstitution).to.equal(values.substitute(type));
        });
        test(`should not compile with an implicit path and an implicit type ${type}`, () => {
          // @ts-expect-error Strings are not valid implicit values for types.
          attributeType("whatever", type);
        });
      }
    });
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
    suite(contains.name, () => {
      test("should not compile with size as lhs operand", () => {
        // TODO: used to result in a runtime error, but now that expressions (including size)
        // are plain objects, it doesn't (it passes the isNativeMap test). To circumvent this,
        // and for the future, those should be schematized properly.
        // See https://github.com/infra-blocks/ts-aws-dynamodb/issues/108
        // @ts-expect-error size is not a valid lhs operand for contains.
        contains(size(path("test.attribute")), value("test.value"));
      });
      test("should work with paths", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = matchExpression({
          expression: contains(path(lhs), path(rhs)),
          matcher: /contains\((#\S+),\s*(#\S+)\)/,
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
          expression: contains(lhs, rhs),
          matcher: /contains\((#\S+),\s*(#\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
      test("should work with values", () => {
        const lhs = "I am a cuntish string";
        const rhs = "Maybe I am contained in the previous cuntish string";
        const { match, values } = matchExpression({
          expression: contains(value(lhs), value(rhs)),
          matcher: /contains\((:\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
      test("should work with implicit values", () => {
        const lhs = new Set([1, 2, 3]);
        const rhs = 4;
        const { match, values } = matchExpression({
          expression: contains(lhs, rhs),
          matcher: /contains\((:\S+),\s*(:\S+)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(values.substitute(lhs));
        expect(rhsSubstitution).to.equal(values.substitute(rhs));
      });
      test("should with with size as rhs operand", () => {
        const lhs = "test.attribute.lhs";
        const rhs = "test.attribute.rhs";
        const { match, names } = matchExpression({
          expression: contains(path(lhs), size(path(rhs))),
          matcher: /contains\((#\S+),\s*size\((#\S+)\)\)/,
        });
        const lhsSubstitution = match[1];
        const rhsSubstitution = match[2];
        expect(lhsSubstitution).to.equal(names.substitute(lhs));
        expect(rhsSubstitution).to.equal(names.substitute(rhs));
      });
    });
  });
};
