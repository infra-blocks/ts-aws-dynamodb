import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../../src/commands/attributes/names.js";
import { isPathInput } from "../../../../../src/commands/expressions/operands/path.js";
import { literal, path } from "../../../../../src/index.js";

describe("commands.expressions.operands.path", () => {
  describe(path.name, () => {
    it("should correctly substitute the value", () => {
      const operand = path("big.toto");
      const names = AttributeNames.create();
      const result = operand.format({ names });
      expect(result).to.equal(names.substitute("big.toto"));
      expect(result).to.equal("#attr1.#attr2");
    });
  });
  describe(literal.name, () => {
    it("should correctly substitute the value", () => {
      const operand = literal("big.toto");
      const names = AttributeNames.create();
      const result = operand.format({ names });
      expect(result).to.equal(names.substitute("big.toto", { literal: true }));
      expect(result).to.equal("#attr1");
    });
  });
  describe(isPathInput.name, () => {
    const invalid = [
      { name: "array", value: [1, "toto", false] },
      { name: "bigint", value: 42n },
      { name: "boolean", value: true },
      { name: "buffer", value: Buffer.from("toto") },
      { name: "null", value: null },
      { name: "number", value: 42 },
      { name: "object", value: { toto: "tata", tutu: 42 } },
      { name: "set", value: new Set([1, 2, 3]) },
    ];

    for (const { name, value } of invalid) {
      it(`should return false for ${name}`, () => {
        expect(isPathInput(value)).to.be.false;
      });
    }

    it("should return true for string", () => {
      expect(isPathInput("foo.bar.baz")).to.be.true;
    });
    it("should return true for path instance", () => {
      expect(isPathInput(path("foo.bar.baz"))).to.be.true;
    });
  });
});
