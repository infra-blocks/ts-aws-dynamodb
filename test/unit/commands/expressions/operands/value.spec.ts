import { expect } from "@infra-blocks/test";
import { AttributeValues } from "../../../../../src/commands/attributes/values.js";
import {
  type AttributeValue,
  isLooseValueOperand,
  isValueOperand,
  ValueOperand,
  value,
} from "../../../../../src/index.js";

describe("commands.expressions.operands.value", () => {
  describe(ValueOperand.name, () => {
    type Sample = {
      typeName: string;
      value: AttributeValue;
    };
    const samples: Sample[] = [
      { typeName: "null", value: null },
      { typeName: "number", value: 42 },
      { typeName: "bigint", value: 42n },
      { typeName: "bool", value: true },
      { typeName: "string", value: "value" },
      // There are plenty of binary types. We're just testing one.
      { typeName: "buffer", value: Buffer.from("value") },
      { typeName: "set", value: new Set<string>() },
      { typeName: "array", value: [] },
      { typeName: "object", value: {} },
    ];

    describe(value.name, () => {
      for (const sample of samples) {
        it(`should create a new instance with a ${sample.typeName}`, () => {
          const operand = value(sample.value);
          expect(operand).to.be.instanceOf(ValueOperand);
        });
      }
      it("should reuse the same instance for an operand", () => {
        const inner = value(42);
        const outer = value(inner);
        expect(inner).to.equal(outer);
      });
    });
    describe(isValueOperand.name, () => {
      it("should return false for a number", () => {
        expect(isValueOperand(42)).to.be.false;
      });
      it("should return true for a ValueOperand", () => {
        const operand = value(42);
        expect(isValueOperand(operand)).to.be.true;
      });
    });
    describe(isLooseValueOperand.name, () => {
      for (const sample of samples) {
        if (sample.typeName === "string") {
          it("should return false for a string", () => {
            expect(isLooseValueOperand(sample.value)).to.be.false;
          });
        } else {
          it(`should return true for a ${sample.typeName}`, () => {
            expect(isLooseValueOperand(sample.value)).to.be.true;
          });
        }
      }
    });
    describe("substitute", () => {
      it("should correctly substitute the value", () => {
        const operand = value(42);
        const values = AttributeValues.create();
        expect(operand.substitute({ values })).to.equal(values.substitute(42));
      });
    });
  });
});
