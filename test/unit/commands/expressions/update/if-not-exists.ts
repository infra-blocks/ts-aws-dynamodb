import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import type { IfNotExists } from "../../../../../src/commands/expressions/update/if-not-exists.js";
import { ifNotExists, path, value } from "../../../../../src/index.js";
import { matchExpression } from "../lib.js";

export const ifNotExistsTests = () => {
  suite(ifNotExists.name, () => {
    test("should work with a path as lhs and a path as default", () => {
      const attribute = "attr.path";
      const defaultAttribute = "attr.defaultPath";
      const { match, names } = matchExpression({
        expression: ifNotExists(path(attribute), path(defaultAttribute)),
        matcher: /if_not_exists\((#\S+),\s+(#\S+)\)/,
      });

      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(defaultAttribute));
    });
    test("should work with an implicit path as lhs and a path as default", () => {
      const attribute = "attr.path";
      const defaultAttribute = "attr.defaultPath";
      const { match, names } = matchExpression({
        expression: ifNotExists(attribute, path(defaultAttribute)),
        matcher: /if_not_exists\((#\S+),\s+(#\S+)\)/,
      });

      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(names.substitute(defaultAttribute));
    });
    test("should work with a path as lhs and value as default", () => {
      const attribute = "attr.path";
      const defaultValue = [1, 2, 3];
      const { match, names, values } = matchExpression({
        expression: ifNotExists(path(attribute), value(defaultValue)),
        matcher: /if_not_exists\((#\S+),\s+(:\S+)\)/,
      });

      expect(match[1]).to.equal(names.substitute(attribute));
      expect(match[2]).to.equal(values.substitute(defaultValue));
    });
    test("should carry the type of its default value", () => {
      const attribute = "attr.path";
      const defaultValue = new Set([1, 2, 3]);
      // Just validating that it compiles and doesn't throw at runtime.
      // biome-ignore lint/correctness/noUnusedVariables: see above.
      const result: IfNotExists<Set<number>> = ifNotExists(
        path(attribute),
        value(defaultValue),
      );
    });
  });
};
