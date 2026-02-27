import { suite } from "node:test";
import { getItemTests } from "./get-item.js";

export const inputTests = () => {
  suite("inputs", () => {
    getItemTests();
  });
};
