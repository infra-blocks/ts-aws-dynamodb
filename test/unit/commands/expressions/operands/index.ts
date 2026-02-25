import { suite } from "node:test";
import { operandTests } from "./operand.js";
import { pathTests } from "./path.js";
import { pathOrValueTests } from "./path-or-value.js";
import { sizeTests } from "./size.js";
import { valueTests } from "./value.js";

export const operandsTests = () => {
  suite("operands", () => {
    operandTests();
    pathOrValueTests();
    pathTests();
    valueTests();
    sizeTests();
  });
};
