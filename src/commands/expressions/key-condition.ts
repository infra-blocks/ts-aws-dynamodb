import { type Brand, trusted } from "@infra-blocks/types";
import { Condition, type ConditionInput } from "./condition/index.js";
import type { ExpressionFormatter } from "./formatter.js";
import type { BeginsWith } from "./functions/begins-with.js";

/*
A key attribute *must be* a top level attribute of type String, Number, or Binary.

Note: If the size function/operator is used in a KeyConditionExpression, the API will fail with
"KeyConditionExpressions cannot contain nested operations.".
*/

// TODO: narrow this type.
// This is a straight up subset of {@link Condition}
export type KeyConditionInput = ConditionInput;

// TODO: the comparison operators should not include the size function as a valid operand.
export type KeyConditionComparison = never;

export type KeyConditionFunction = BeginsWith;

export type KeyCondition = ExpressionFormatter & Brand<"KeyCondition">;

export const KeyCondition = {
  from(input: KeyConditionInput): KeyCondition {
    return trusted({
      // Same as a condition, just supports a subset of inputs.
      ...Condition.from(input),
    });
  },
};
