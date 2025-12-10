import { expect } from "@infra-blocks/test";
import { dateToTtl } from "../../src/index.js";

describe("utils", () => {
  describe(dateToTtl.name, () => {
    it("should work with the genesis date", () => {
      expect(dateToTtl(new Date("1970-01-01T00:00:00Z"))).to.equal(0);
    });
    it("should work with a date where the miliseconds are rounded down", () => {
      expect(dateToTtl(new Date("1970-01-01T00:01:00.499Z"))).to.equal(60);
    });
    it("should work with a date where the miliseconds are rounded up", () => {
      expect(dateToTtl(new Date("1970-01-01T00:02:00.500Z"))).to.equal(121);
    });
  });
});
