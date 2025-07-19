import { expect, fakerFor, sinon } from "@infra-blocks/test";
import type { AttributeNames } from "../../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../../src/commands/attributes/values.js";
import { ValueOperand, value } from "../../../../../src/index.js";

describe("commands.expressions.operands.value", () => {
  const fakeAttributeNames = fakerFor<AttributeNames>();

  describe(ValueOperand.name, () => {
    it("should be correctly substitute the value", () => {
      const operand = value(42);
      const substituteName = sinon.fake();
      const names = fakeAttributeNames({ substitute: substituteName });
      const values = AttributeValues.create();
      expect(operand.substitute({ names, values })).to.equal(
        values.substitute(42),
      );
      expect(substituteName).to.not.have.been.called;
    });
  });
});
