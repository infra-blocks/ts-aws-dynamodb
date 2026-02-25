import { suite } from "node:test";
import { namesTests } from "./names.js";
import { reservedWordsTests } from "./reserved-words.js";
import { valuesTests } from "./values.js";

export const attributesTests = () => {
  suite("attributes", () => {
    namesTests();
    reservedWordsTests();
    valuesTests();
  });
};
