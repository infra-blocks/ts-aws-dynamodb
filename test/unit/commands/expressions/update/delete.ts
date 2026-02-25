import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { deleteFrom, path, value } from "../../../../../src/index.js";
import { matchAction } from "./lib.js";

export const deleteTests = () => {
  suite(deleteFrom.name, () => {
    test("should not compile with a path and a string", () => {
      // @ts-expect-error A string is not a valid rhs operand for delete.
      deleteFrom(path("name"), value("toto"));
    });
    test("should not compile with a path and a number", () => {
      // @ts-expect-error A number is not a valid rhs operand for delete.
      deleteFrom(path("name"), value(42));
    });
    test("should not compile with a path and a boolean", () => {
      // @ts-expect-error A boolean is not a valid rhs operand for delete.
      deleteFrom(path("name"), value(true));
    });
    test("should not compile with a path and null", () => {
      // @ts-expect-error Null is not a valid rhs operand for delete.
      deleteFrom(path("name"), value(null));
    });
    test("should not compile with a path and undefined", () => {
      // @ts-expect-error Undefined is not a valid rhs operand for delete.
      deleteFrom(path("name"), value(undefined));
    });
    test("should not compile with a path and a record", () => {
      // @ts-expect-error A record is not a valid rhs operand for delete.
      deleteFrom(path("name"), value({}));
    });
    test("should not compile with a path and an array", () => {
      // @ts-expect-error An array is not a valid rhs operand for delete.
      deleteFrom(path("name"), value([]));
    });
    test("should work with a path and a set", () => {
      const deleted = new Set(["toto", "tata", "tutu"]);
      const { match, names, values } = matchAction({
        action: deleteFrom(path("attr.name"), value(deleted)),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(deleted));
    });
    test("should work with an implicit path and a set", () => {
      const deleted = new Set(["toto", "tata", "tutu"]);
      const { match, names, values } = matchAction({
        action: deleteFrom("attr.name", value(deleted)),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(deleted));
    });
    test("should work with an implicit path and an implicit set", () => {
      const deleted = new Set(["toto", "tata", "tutu"]);
      const { match, names, values } = matchAction({
        action: deleteFrom("attr.name", deleted),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(deleted));
    });
  });
};
