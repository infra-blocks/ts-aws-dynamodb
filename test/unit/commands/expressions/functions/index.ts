import { suite } from "node:test";
import { beginsWithTests } from "./begins-with.js";

export const functionsTests = () => {
  suite("functions", () => {
    beginsWithTests();
  });
};
