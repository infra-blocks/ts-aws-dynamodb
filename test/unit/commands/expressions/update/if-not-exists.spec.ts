import { expect } from "@infra-blocks/test";
import { ifNotExists, path, value } from "../../../../../src/index.js";
import { operandMatch } from "./action-match.js";

describe("commands.expressions.update.if-not-exists", () => {
  describe(ifNotExists.name, () => {
    it("should work with an attribute name as default value", () => {
      const attribute = "attr.path";
      const defaultAttribute = "attr.defaultPath";
      const { match, names } = operandMatch({
        operand: ifNotExists(path(attribute), path(defaultAttribute)),
        matcher: /if_not_exists\((#\S+),\s+(#\S+)\)/,
      });

      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(defaultAttribute));
    });
    it("should work with an attribute value as default value", () => {
      const attribute = "attr.path";
      const defaultValue = [1, 2, 3];
      const { match, names, values } = operandMatch({
        operand: ifNotExists(path(attribute), value(defaultValue)),
        matcher: /if_not_exists\((#\S+),\s+(:\S+)\)/,
      });

      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(values.substitute(defaultValue));
    });
  });
});
