import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { Operand } from "../../../../../src/commands/expressions/index.js";
import { isPath } from "../../../../../src/commands/expressions/operands/path.js";
import { isSize } from "../../../../../src/commands/expressions/operands/size.js";
import { isValue } from "../../../../../src/commands/expressions/operands/value.js";
import { path, size, value } from "../../../../../src/index.js";

export const operandTests = () => {
  suite("operand", () => {
    suite(Operand.normalize.name, () => {
      test("should work for an implicit path", () => {
        expect(isPath(Operand.normalize("toto"))).to.be.true;
      });
      test("should work for an explicit path", () => {
        expect(isPath(Operand.normalize(path("toto")))).to.be.true;
      });
      test("should work for an implitic value", () => {
        expect(isValue(Operand.normalize(42))).to.be.true;
      });
      test("should work for an explicit value", () => {
        expect(isValue(Operand.normalize(value(42)))).to.be.true;
      });
      test("should work for size", () => {
        expect(isSize(Operand.normalize(size("toto")))).to.be.true;
      });
    });
  });
};
