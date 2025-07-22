import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../../src/commands/attributes/names.js";
import {
  isLoosePathOperand,
  isPathOperand,
  PathOperand,
  path,
} from "../../../../../src/index.js";

describe("commands.expressions.operands.path", () => {
  describe(PathOperand.name, () => {
    describe(path.name, () => {
      it("should create a new instance with a string", () => {
        const operand = path("big.toto");
        expect(operand).to.be.instanceOf(PathOperand);
      });
      it("should reuse the same instance for an operand", () => {
        const inner = path("big.toto");
        const outer = path(inner);
        expect(inner).to.equal(outer);
      });
    });
    describe(isPathOperand.name, () => {
      it("should return false for a string", () => {
        expect(isPathOperand("big.toto")).to.be.false;
      });
      it("should return true for a PathOperand", () => {
        const operand = path("big.toto");
        expect(isPathOperand(operand)).to.be.true;
      });
    });
    describe(isLoosePathOperand.name, () => {
      it("should return false for a number", () => {
        expect(isLoosePathOperand(42)).to.be.false;
      });
      it("should return true for a string", () => {
        expect(isLoosePathOperand("big.toto")).to.be.true;
      });
      it("should return true for a PathOperand", () => {
        const operand = path("big.toto");
        expect(isLoosePathOperand(operand)).to.be.true;
      });
    });
    describe("substitute", () => {
      it("should correctly substitute the value", () => {
        const operand = path("big.toto");
        const names = AttributeNames.create();
        expect(operand.substitute({ names })).to.equal(
          names.substitute("big.toto"),
        );
      });
    });
  });
});
