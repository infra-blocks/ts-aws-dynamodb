import { suite } from "node:test";
import { addTests } from "./add.js";
import { deleteTests } from "./delete.js";
import { ifNotExistsTests } from "./if-not-exists.js";
import { removeTests } from "./remove.js";
import { setTests } from "./set.js";

export const updateTests = () => {
  suite("update", () => {
    addTests();
    deleteTests();
    ifNotExistsTests();
    removeTests();
    setTests();
  });
};
