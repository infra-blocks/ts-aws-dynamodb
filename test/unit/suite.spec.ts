import { suite } from "node:test";
import { commandsTests } from "./commands/index.js";
import { utilsTests } from "./utils.js";

suite("suite", () => {
  utilsTests();
  commandsTests();
});
