import { expect } from "@infra-blocks/test";
import { deleteFrom, path, value } from "../../../../../src/index.js";
import { actionMatch } from "./action-match.js";

describe("commands.expressions.update.delete", () => {
  describe(deleteFrom.name, () => {
    it("should not compile with an attribute name and a string", () => {
      // @ts-expect-error
      deleteFrom(path("name"), value("toto"));
    });
    it("should not compile with an attribute name and a number", () => {
      // @ts-expect-error
      deleteFrom(path("name"), value(42));
    });
    it("should not compile with an attribute name and a boolean", () => {
      // @ts-expect-error
      deleteFrom(path("name"), value(true));
    });
    it("should not compile with an attribute name and null", () => {
      // @ts-expect-error
      deleteFrom(path("name"), value(null));
    });
    it("should not compile with an attribute name and undefined", () => {
      // @ts-expect-error
      deleteFrom(path("name"), value(undefined));
    });
    it("should not compile with an attribute name and a record", () => {
      // Records are maps, which aren't sets or numbers.
      // @ts-expect-error
      deleteFrom(path("name"), value({}));
    });
    it("should not compile with an attribute name and an array", () => {
      // Arrays are lists, which aren't sets or numbers.
      // @ts-expect-error
      deleteFrom(path("name"), value([]));
    });
    it("should work with an attribute name and a set", () => {
      const deleted = new Set(["toto", "tata", "tutu"]);
      const { match, names, values } = actionMatch({
        action: deleteFrom(path("attr.name"), value(deleted)),
        matcher: /(#\S+)\s+(:\S+)/,
      });
      expect(match[1]).to.equal(names.substitute("attr.name"));
      expect(match[2]).to.equal(values.substitute(deleted));
    });
  });
});
