import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../src/commands/attributes/names.js";

describe("commands.attributes.names", () => {
  describe(AttributeNames.name, () => {
    describe("substitute", () => {
      it("should return the expected substitution for a field", () => {
        const names = AttributeNames.create();
        const substitute = names.substitute("field");
        expect(substitute).to.equal("#attr1");
      });
      it("should return the expected substitution for a nested field", () => {
        const names = AttributeNames.create();
        const substitute = names.substitute("field.nested");
        expect(substitute).to.equal("#attr1.#attr2");
      });
      it("should return the same substitution for the same field", () => {
        const names = AttributeNames.create();
        const first = names.substitute("field");
        const second = names.substitute("field");
        expect(first).to.equal(second);
      });
      it("should return the same substitution for the same nested field", () => {
        const names = AttributeNames.create();
        const first = names.substitute("inner.outer");
        const second = names.substitute("outer.inner");
        expect(first).to.equal("#attr1.#attr2");
        expect(second).to.equal("#attr2.#attr1");
      });
    });
    describe("getSubstitutions", () => {
      it("should return undefined if no substitutions were generated", () => {
        const names = AttributeNames.create();
        expect(names.getSubstitutions()).to.be.undefined;
      });
      it("should return one value per unique substitution made", () => {
        const names = AttributeNames.create();
        names.substitute("field1");
        names.substitute("field2");
        // Do the same substitution again.
        names.substitute("field1");
        names.substitute("field3");
        const substitutions = names.getSubstitutions();
        expect(substitutions).to.deep.equal({
          "#attr1": "field1",
          "#attr2": "field2",
          "#attr3": "field3",
        });
      });
    });
  });
});
