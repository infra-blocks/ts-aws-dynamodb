import { expect } from "@infra-blocks/test";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";

describe("commands.attributes.values", () => {
  describe(AttributeValues.name, () => {
    describe("substitute", () => {
      it("should return the expected substitution for a string", () => {
        const values = AttributeValues.create();
        const substitute = values.substitute("some stuff");
        expect(substitute).to.equal(":value1");
      });
      it("should return the expected substitution for a number", () => {
        const values = AttributeValues.create();
        const substitute = values.substitute(42);
        expect(substitute).to.equal(":value1");
      });
      it("should return the expected substitution for a boolean", () => {
        const values = AttributeValues.create();
        const substitute = values.substitute(true);
        expect(substitute).to.equal(":value1");
      });
      it("should return the expected substitution for a null value", () => {
        const values = AttributeValues.create();
        const substitute = values.substitute(null);
        expect(substitute).to.equal(":value1");
      });
      // TODO: finish with other types :)
      it("should return the same substitution for the same value", () => {
        const values = AttributeValues.create();
        const firstSubstitute = values.substitute("that's the same");
        const secondSubstitute = values.substitute("that's the same");
        expect(firstSubstitute).to.equal(secondSubstitute);
      });
    });
    describe("getSubstitutions", () => {
      it("should return undefined if no substitutions were generated", () => {
        const values = AttributeValues.create();
        expect(values.getSubstitutions()).to.be.undefined;
      });
      it("should return one value per unique substitution made", () => {
        const values = AttributeValues.create();
        values.substitute("big ol' tédé");
        values.substitute(42);
        values.substitute(true);
        // Do the same substitution again.
        values.substitute(42);
        values.substitute(null);
        const substitutions = values.getSubstitutions();
        expect(substitutions).to.deep.equal({
          ":value1": "big ol' tédé",
          ":value2": 42,
          ":value3": true,
          ":value4": null,
        });
      });
    });
  });
});
