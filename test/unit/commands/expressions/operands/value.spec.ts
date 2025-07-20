import { expect } from "@infra-blocks/test";
import { AttributeValues } from "../../../../../src/commands/attributes/values.js";
import { ValueOperand, value } from "../../../../../src/index.js";

describe("commands.expressions.operands.value", () => {
  describe(ValueOperand.name, () => {
    it("should be correctly substitute the value", () => {
      const operand = value(42);
      const values = AttributeValues.create();
      expect(operand.substitute({ values })).to.equal(values.substitute(42));
    });
  });
});
