import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../../src/commands/attributes/names.js";
import { PathOperand, path } from "../../../../../src/index.js";

describe("commands.expressions.operands.name", () => {
  describe(PathOperand.name, () => {
    it("should be correctly substitute the value", () => {
      const operand = path("big.toto");
      const names = AttributeNames.create();
      expect(operand.substitute({ names })).to.equal(
        names.substitute("big.toto"),
      );
    });
  });
});
