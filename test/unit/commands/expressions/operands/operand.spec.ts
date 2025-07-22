import { expect } from "@infra-blocks/test";
import {
  operand,
  PathOperand,
  path,
  ValueOperand,
  value,
} from "../../../../../src/index.js";

describe("commands.expressions.operands.path", () => {
  describe(operand.name, () => {
    it("should not compile and throw with a date", () => {
      //@ts-expect-error Date is not a valid operand
      expect(() => operand(new Date())).to.throw();
    });
    it("should return the same instance if already a path operand", () => {
      const inner = path("big.toto");
      const outer = operand(inner);
      expect(inner).to.equal(outer);
      expect(outer).to.be.instanceOf(PathOperand);
    });
    it("should return the same instance if already a value operand", () => {
      const inner = value("big.toto");
      const outer = operand(inner);
      expect(inner).to.equal(outer);
      expect(outer).to.be.instanceOf(ValueOperand);
    });
    it("should return a path operand if given a string", () => {
      const result = operand("big.toto");
      expect(result).to.be.instanceOf(PathOperand);
    });
    it("should return a value operand if given a buffer", () => {
      const result = operand(Buffer.from("big.toto"));
      expect(result).to.be.instanceOf(ValueOperand);
    });
    it("should return a value operand if given a boolean", () => {
      const result = operand(true);
      expect(result).to.be.instanceOf(ValueOperand);
    });
    it("should return a value operand if given a number", () => {
      const result = operand(42);
      expect(result).to.be.instanceOf(ValueOperand);
    });
    it("should return a value operand if given an array", () => {
      const result = operand([]);
      expect(result).to.be.instanceOf(ValueOperand);
    });
    it("should return a value operand if given an object", () => {
      const result = operand({});
      expect(result).to.be.instanceOf(ValueOperand);
    });
    it("should return a value operand if given a set", () => {
      const result = operand(new Set<string>());
      expect(result).to.be.instanceOf(ValueOperand);
    });
  });
});
