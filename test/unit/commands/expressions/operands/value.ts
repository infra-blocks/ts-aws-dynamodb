import { suite, test } from "node:test";
import { expect, expectTypeOf } from "@infra-blocks/test";
import { AttributeValues } from "../../../../../src/commands/attributes/values.js";
import {
  isValueInput,
  type Value,
  type ValueInput,
} from "../../../../../src/commands/expressions/operands/value.js";
import {
  type KeyAttributeValue,
  type NativeBinary,
  type NativeNumber,
  value,
} from "../../../../../src/index.js";

export const valueTests = () => {
  suite("value", () => {
    suite("ValueInput", () => {
      // This is a regression test where the previous typing did not allow Value<KeyAttributeValue> to
      // extend ValueInput<KeyAttributeValue>. The latter resolved to a union of type number | Value<number> | ...
      // which the base type could not extend, as its own inner value of KeyAttributeValue wasn't assignable
      // to any of those. That is a bug, because the below code is indeed correct.
      test("should allow a union typed value", () => {
        expectTypeOf<Value<KeyAttributeValue>>().toExtend<
          ValueInput<KeyAttributeValue>
        >();
        expectTypeOf<ValueInput<KeyAttributeValue>>().toEqualTypeOf<
          Value<KeyAttributeValue> | NativeNumber | NativeBinary
        >();
      });
    });

    suite("Value", () => {
      test("should allow a singleton type to extend a union type", () => {
        expectTypeOf<Value<number>>().toExtend<Value<KeyAttributeValue>>();
      });
    });

    suite(value.name, () => {
      test("should be correctly substitute the value", () => {
        const operand = value(42);
        const values = AttributeValues.create();
        expect(operand.format({ values })).to.equal(values.substitute(42));
      });
    });

    suite(isValueInput.name, () => {
      test("should return false for string", () => {
        expect(isValueInput("foo")).to.be.false;
      });

      const valid = [
        { name: "array", value: [1, "toto", false] },
        { name: "bigint", value: 42n },
        { name: "boolean", value: true },
        { name: "buffer", value: Buffer.from("toto") },
        { name: "null", value: null },
        { name: "number", value: 42 },
        { name: "object", value: { toto: "tata", tutu: 42 } },
        { name: "set", value: new Set([1, 2, 3]) },
      ];

      for (const { name, value } of valid) {
        test(`should return true for ${name}`, () => {
          expect(isValueInput(value)).to.be.true;
        });
      }

      test("should return true for value", () => {
        // Notice how string values are possible, they just need to be wrapped.
        expect(isValueInput(value("toto"))).to.be.true;
      });
    });
  });
};
