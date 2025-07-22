import { expect } from "@infra-blocks/test";
import { path, remove } from "../../../../../src/index.js";
import { actionMatch } from "./action-match.js";

describe("commands.expressions.update.remove", () => {
  describe(remove.name, () => {
    it("should work with an attribute name", () => {
      const attribute = "attr.path";
      const { match, names } = actionMatch({
        action: remove(path(attribute)),
        // Should only dispatch to the operand.
        matcher: /(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
    });
  });
});
