import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { add, path, value } from "../../../../../src/index.js";
import { matchAction } from "./lib.js";

export const addTests = () => {
  suite(add.name, () => {
    test("should not compile with an attribute name and a string", () => {
      // @ts-expect-error A string is not a valid rhs operand for add.
      add(path("name"), value("toto"));
    });
    test("should not compile with an attribute name and a boolean", () => {
      // @ts-expect-error A boolean is not a valid rhs operand for add.
      add(path("name"), value(true));
    });
    test("should not compile with an attribute name and null", () => {
      // @ts-expect-error Null is not a valid rhs operand for add.
      add(path("name"), value(null));
    });
    test("should not compile with an attribute name and undefined", () => {
      // @ts-expect-error Undefined is not a valid rhs operand for add.
      add(path("name"), value(undefined));
    });
    test("should not compile with an attribute name and a record", () => {
      // @ts-expect-error A record is not a valid rhs operand for add.
      add(path("name"), value({}));
    });
    test("should not compile with an attribute name and an array", () => {
      // @ts-expect-error An array is not a valid rhs operand for add.
      add(path("name"), value([]));
    });
    test("should work with a path and a number", () => {
      const { match, names, values } = matchAction({
        action: add(path("attr.name"), value(42)),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(42));
    });
    test("should work with an implicit path and a number", () => {
      const { match, names, values } = matchAction({
        action: add("attr.name", value(42)),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(42));
    });
    test("should work with an implicit path and an implicit number", () => {
      const { match, names, values } = matchAction({
        action: add("attr.name", 42),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(42));
    });
    test("should work with a path name and a set", () => {
      const added = new Set(["toto", "tata", "tutu"]);
      const { match, names, values } = matchAction({
        action: add(path("attr.name"), value(added)),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(added));
    });
    test("should work with an implicit path name and a set", () => {
      const added = new Set(["toto", "tata", "tutu"]);
      const { match, names, values } = matchAction({
        action: add("attr.name", value(added)),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(added));
    });
    test("should work with an implicit path name and an implicit set", () => {
      const added = new Set(["toto", "tata", "tutu"]);
      const { match, names, values } = matchAction({
        action: add("attr.name", added),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(added));
    });
  });
};
