import { checkNotNull } from "@infra-blocks/checks";
import { expect } from "@infra-blocks/test";
import { AttributeNames } from "../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../src/commands/attributes/values.js";
import {
  assign,
  attribute,
  ifNotExists,
  type UpdateAction,
  value,
} from "../../../../src/index.js";

describe("commands.expressions.update", () => {
  function actionMatch(params: { action: UpdateAction; matcher: RegExp }): {
    names: AttributeNames;
    values: AttributeValues;
    match: RegExpExecArray;
  } {
    const { action, matcher } = params;
    const names = AttributeNames.create();
    const values = AttributeValues.create();
    const match = checkNotNull(
      matcher.exec(action.stringify({ names, values })),
    );
    return {
      names: names,
      values: values,
      match,
    };
  }

  describe("SetAction", () => {
    describe(assign.name, () => {
      it("should work with an attribute name", () => {
        const path = "attr.path";
        const operand = "attr.operand";
        const { match, names } = actionMatch({
          action: assign(attribute(path)).to(attribute(operand)),
          matcher: /(#\S+)\s+=\s+(#\S+)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(names.substitute(operand));
      });
      it("should work with an attribute value", () => {
        const path = "attr.path";
        const operand = 42;
        const { match, names, values } = actionMatch({
          action: assign(attribute(path)).to(value(operand)),
          matcher: /(#\S+)\s+=\s+(:\S+)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(values.reference(operand));
      });
      it("should work with an if_not_exists operand with attribute default value", () => {
        const path = "attr.path";
        const operand = "attr.operand";
        const { match, names } = actionMatch({
          action: assign(attribute(path)).to(
            ifNotExists(attribute(path), attribute(operand)),
          ),
          matcher: /(#\S+)\s+=\s+if_not_exists\((#\S+),\s+(#\S+)\)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(names.substitute(path));
        expect(match[3]).to.equal(names.substitute(operand));
      });
      it("should work with an if_not_exists operand with value default value", () => {
        const path = "attr.path";
        const otherPath = "attr.otherPath";
        const defaultValue = 42;
        const { match, names, values } = actionMatch({
          action: assign(attribute(path)).to(
            ifNotExists(attribute(otherPath), value(defaultValue)),
          ),
          matcher: /(#\S+)\s+=\s+if_not_exists\((#\S+),\s+(:\S+)\)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(names.substitute(otherPath));
        expect(match[3]).to.equal(values.reference(defaultValue));
      });
      it("should be able to add an attribute as part of the assignment", () => {
        const path = "attr.path";
        const lhs = "attr.lhs";
        const rhs = "attr.rhs";
        const { match, names } = actionMatch({
          action: assign(attribute(path))
            .to(attribute(lhs))
            .plus(attribute(rhs)),
          matcher: /(#\S+)\s+=\s+(#\S+)\s+\+\s+(#\S+)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(names.substitute(lhs));
        expect(match[3]).to.equal(names.substitute(rhs));
      });
      it("should be able to add a value as part of the assignment", () => {
        const path = "attr.path";
        const lhs = "attr.lhs";
        const rhs = 42;
        const { match, names, values } = actionMatch({
          action: assign(attribute(path)).to(attribute(lhs)).plus(value(rhs)),
          matcher: /(#\S+)\s+=\s+(#\S+)\s+\+\s+(:\S+)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(names.substitute(lhs));
        expect(match[3]).to.equal(values.reference(rhs));
      });
      it("should be able to add an attribute if it exists or a default value otherwise", () => {
        const path = "attr.path";
        const lhs = "attr.lhs";
        const rhs = "attr.rhs";
        const defaultValue = 42;
        const { match, names, values } = actionMatch({
          action: assign(attribute(path))
            .to(attribute(lhs))
            .plus(ifNotExists(attribute(rhs), value(defaultValue))),
          matcher:
            /(#\S+)\s+=\s+(#\S+)\s+\+\s+if_not_exists\((#\S+),\s+(:\S+)\)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(names.substitute(lhs));
        expect(match[3]).to.equal(names.substitute(rhs));
        expect(match[4]).to.equal(values.reference(defaultValue));
      });
      it("should be able to subtract an attribute as part of the assignment", () => {
        const path = "attr.path";
        const lhs = "attr.lhs";
        const rhs = "attr.rhs";
        const { match, names } = actionMatch({
          action: assign(attribute(path))
            .to(attribute(lhs))
            .minus(attribute(rhs)),
          matcher: /(#\S+)\s+=\s+(#\S+)\s+-\s+(#\S+)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(names.substitute(lhs));
        expect(match[3]).to.equal(names.substitute(rhs));
      });
      it("should be able to subtract a value as part of the assignment", () => {
        const path = "attr.path";
        const lhs = "attr.lhs";
        const rhs = 42;
        const { match, names, values } = actionMatch({
          action: assign(attribute(path)).to(attribute(lhs)).minus(value(rhs)),
          matcher: /(#\S+)\s+=\s+(#\S+)\s+-\s+(:\S+)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(names.substitute(lhs));
        expect(match[3]).to.equal(values.reference(rhs));
      });
      it("should be able to subtract an attribute if it exists or a default value otherwise", () => {
        const path = "attr.path";
        const lhs = "attr.lhs";
        const rhs = "attr.rhs";
        const defaultValue = 42;
        const { match, names, values } = actionMatch({
          action: assign(attribute(path))
            .to(attribute(lhs))
            .minus(ifNotExists(attribute(rhs), value(defaultValue))),
          matcher:
            /(#\S+)\s+=\s+(#\S+)\s+-\s+if_not_exists\((#\S+),\s+(:\S+)\)/,
        });
        expect(match[1]).to.equal(names.substitute(path));
        expect(match[2]).to.equal(names.substitute(lhs));
        expect(match[3]).to.equal(names.substitute(rhs));
        expect(match[4]).to.equal(values.reference(defaultValue));
      });
    });
  });
});
