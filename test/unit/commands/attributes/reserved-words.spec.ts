import { expect } from "@infra-blocks/test";
import { isReservedWord } from "../../../../src/commands/attributes/reserved-words.js";

describe("commands.attributes.reserved-words", () => {
  describe(isReservedWord.name, () => {
    const words: Array<{ expected: boolean; item: string }> = [
      { expected: true, item: "SELECT" },
      { expected: true, item: "select" },
      { expected: true, item: "seLeCt" },
      { expected: true, item: "FROM" },
      { expected: true, item: "from" },
      { expected: true, item: "fRoM" },
      { expected: false, item: "selects" },
      { expected: false, item: "form" },
      { expected: false, item: "regularField" },
    ];
    for (const { expected, item } of words) {
      it(`should return ${expected} for ${item}`, () => {
        expect(isReservedWord(item)).to.equal(expected);
      });
    }
  });
});
