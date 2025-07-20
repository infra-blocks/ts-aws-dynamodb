import { expect } from "@infra-blocks/test";
import { attribute, ifNotExists, value } from "../../../../../src/index.js";
import { operandMatch } from "./action-match.js";

describe("commands.expressions.update.if-not-exists", () => {
  describe(ifNotExists.name, () => {
    it("should work with an attribute name as default value", () => {
      const path = "attr.path";
      const defaultPath = "attr.defaultPath";
      const { match, names } = operandMatch({
        operand: ifNotExists(attribute(path), attribute(defaultPath)),
        matcher: /if_not_exists\((#\S+),\s+(#\S+)\)/,
      });

      expect(match[1]).to.equal(names.substitute(path));
      expect(match[2]).to.equal(names.substitute(defaultPath));
    });
    it("should work with an attribute value as default value", () => {
      const path = "attr.path";
      const defaultValue = [1, 2, 3];
      const { match, names, values } = operandMatch({
        operand: ifNotExists(attribute(path), value(defaultValue)),
        matcher: /if_not_exists\((#\S+),\s+(:\S+)\)/,
      });

      expect(match[1]).to.equal(names.substitute(path));
      expect(match[2]).to.equal(values.substitute(defaultValue));
    });
  });
});
