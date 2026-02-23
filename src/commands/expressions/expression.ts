import {
  Comparison,
  type ComparisonInput,
  isComparisonInput,
} from "./comparisons/index.js";
import type { FunctionExpression } from "./functions/index.js";
import type { Logic } from "./logic/index.js";

/**
 * A grouping of all input that can be used to create an expression.
 */
export type ExpressionInput = ComparisonInput | FunctionExpression | Logic;

/**
 * A grouping of all expressions.
 */
export type Expression = Comparison | FunctionExpression | Logic;

export const Expression = {
  from(input: ExpressionInput): Expression {
    if (isComparisonInput(input)) {
      return Comparison.from(input);
    }
    return input;
  },
};
