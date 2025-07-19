import { expect, fakerFor, sinon } from "@infra-blocks/test";
import { AttributeNames } from "../../../../../src/commands/attributes/names.js";
import type { AttributeValues } from "../../../../../src/commands/attributes/values.js";
import { AttributeOperand, attribute } from "../../../../../src/index.js";

describe("commands.expressions.operands.name", () => {
  const fakeAttributeValues = fakerFor<AttributeValues>();

  describe(AttributeOperand.name, () => {
    it("should be correctly substitute the value", () => {
      const operand = attribute("big.toto");
      const substituteValue = sinon.fake();
      const names = AttributeNames.create();
      const values = fakeAttributeValues({ substitute: substituteValue });
      expect(operand.substitute({ names, values })).to.equal(
        names.substitute("big.toto"),
      );
      expect(substituteValue).to.not.have.been.called;
    });
  });
});
