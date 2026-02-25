import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { path, remove } from "../../../../../src/index.js";
import { matchAction } from "./lib.js";

export const removeTests = () => {
  suite(remove.name, () => {
    test("should work with a path", () => {
      const attribute = "attr.path";
      const { match, names } = matchAction({
        action: remove(path(attribute)),
        // Should only dispatch to the operand.
        matcher: /(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
    });
    test("should work with an implicit path", () => {
      const attribute = "attr.path";
      const { match, names } = matchAction({
        action: remove(attribute),
        matcher: /(#\S+)/,
      });
      expect(match[1]).to.equal(names.substitute(attribute));
    });
  });
};
