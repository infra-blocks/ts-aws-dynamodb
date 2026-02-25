import { suite } from "node:test";
import { comparisonsTests } from "./comparisons.js";
import { functionsTests } from "./functions.js";
import { logicTests } from "./logic.js";

export const conditionTests = () => {
  suite("condition", () => {
    comparisonsTests();
    functionsTests();
    logicTests();
  });
};
