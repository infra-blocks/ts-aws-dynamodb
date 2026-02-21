import { checkNotNull } from "@infra-blocks/checks";
import { AttributeNames } from "../../../../../src/commands/attributes/names.js";
import { AttributeValues } from "../../../../../src/commands/attributes/values.js";
import type { UpdateAction } from "../../../../../src/index.js";

export function actionMatch(params: {
  action: UpdateAction;
  matcher: RegExp;
}): {
  names: AttributeNames;
  values: AttributeValues;
  match: RegExpExecArray;
} {
  const { action, matcher } = params;
  const names = AttributeNames.create();
  const values = AttributeValues.create();
  const match = checkNotNull(matcher.exec(action.stringify({ names, values })));
  return { names, values, match };
}
