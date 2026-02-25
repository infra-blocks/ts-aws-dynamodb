import { suite, test } from "node:test";
import { expect } from "@infra-blocks/test";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";
import type { AttributeValue } from "../../../../src/types.js";

export const valuesTests = () => {
  suite("values", () => {
    suite(AttributeValues.name, () => {
      suite("substitute", () => {
        type Test = {
          name: string;
          value: AttributeValue;
        };
        // TODO: binary values
        // TODO: records/maps
        const tests: Test[] = [
          { name: "string", value: "some stuff" },
          { name: "number", value: 42 },
          { name: "boolean", value: true },
          { name: "null", value: null },
          { name: "string list", value: ["a", "b", "c"] },
          { name: "number set", value: new Set([1, 2, 3]) },
        ];
        for (const { name, value } of tests) {
          test(`should return the expected substitution for a ${name}`, () => {
            const values = AttributeValues.create();
            const substitute = values.substitute(value);
            expect(substitute).to.equal(":value1");
          });
          test(`should return the same substitution for the same ${name} twice`, () => {
            const values = AttributeValues.create();
            const firstSubstitute = values.substitute(value);
            const secondSubstitute = values.substitute(value);
            expect(firstSubstitute).to.equal(secondSubstitute);
          });
        }
      });
      suite("getSubstitutions", () => {
        test("should return undefined if no substitutions were generated", () => {
          const values = AttributeValues.create();
          expect(values.getSubstitutions()).to.be.undefined;
        });
        test("should return one value per unique substitution made", () => {
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
};
