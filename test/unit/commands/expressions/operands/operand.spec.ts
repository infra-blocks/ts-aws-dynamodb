import { expect } from "@infra-blocks/test";
import {
  operand,
  Path,
  path,
  type RawOperand,
  Value,
  value,
} from "../../../../../src/index.js";

describe("commands.expressions.operands.operand", () => {
  describe(operand.name, () => {
    it("should return the argument if it is a path", () => {
      const arg = path("big.toto");
      expect(operand(arg)).to.equal(arg);
    });
    it("should return a new path if the argument is a string", () => {
      expect(operand("big.toto")).to.be.instanceOf(Path);
    });
    it("should return the argument if it is a value", () => {
      const arg = value("not a path!");
      expect(operand(arg)).to.equal(arg);
    });

    const implicitValues: Array<{ name: string; sample: RawOperand }> = [
      { name: "array", sample: [1, "toto", false] },
      { name: "bigint", sample: 42n },
      { name: "boolean", sample: true },
      { name: "buffer", sample: Buffer.from("toto") },
      { name: "null", sample: null },
      { name: "number", sample: 42 },
      { name: "object", sample: { toto: "tata", tutu: 42 } },
      { name: "set", sample: new Set([1, 2, 3]) },
    ];

    for (const { name, sample } of implicitValues) {
      it(`should return a new value if the argument is a ${name}`, () => {
        expect(operand(sample)).to.be.instanceOf(Value);
      });
    }
  });
});
