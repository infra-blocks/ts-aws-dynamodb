import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { PathOrValue } from "../../../../../src/commands/expressions/index.js";
import { isPath } from "../../../../../src/commands/expressions/operands/path.js";
import { isValue } from "../../../../../src/commands/expressions/operands/value.js";
import {
  type PathOrValueInput,
  path,
  size,
  value,
} from "../../../../../src/index.js";

export const pathOrValueTests = () => {
  suite("PathOrValue", () => {
    test("should not compile with size", () => {
      // @ts-expect-error size is not a valid path or value.
      PathOrValue.normalize(size("toto"));
    });
    test("should return the argument if it is a path", () => {
      const arg = path("big.toto");
      expect(PathOrValue.normalize(arg)).to.equal(arg);
    });
    test("should return a new path if the argument is a string", () => {
      expect(isPath(PathOrValue.normalize("big.toto"))).to.be.true;
    });
    test("should return the argument if it is a value", () => {
      const arg = value("not a path!");
      expect(PathOrValue.normalize(arg)).to.equal(arg);
    });

    const implicitValues: Array<{
      name: string;
      sample: PathOrValueInput;
    }> = [
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
      test(`should return a new value if the argument is a ${name}`, () => {
        expect(isValue(PathOrValue.normalize(sample))).to.be.true;
      });
    }
  });
};
