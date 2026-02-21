import assert from "node:assert";
import type { AttributeNames } from "../attributes/names.js";
import { Path, type RawPath } from "./operands/index.js";

export type ProjectionExpressionParams = ReadonlyArray<RawPath>;

export type ProjectionExpression = {
  stringify(params: { names: AttributeNames }): string;
};

export const ProjectionExpression = {
  /**
   * Constructs a {@link ProjectionExpression} from the provided {@link ProjectionExpressionParams}.
   *
   * Note that an empty expression is an invalid value for the DynamoDB API. To catch this
   * mistake earlier, this function will throw if the provided list of paths is empty.
   *
   * @param expressionParams - The list of paths to include in the projection expression.
   *
   * @returns The {@link ProjectionExpression} corresponding to the provided {@link ProjectionExpressionParams}.
   */
  from(expressionParams: ProjectionExpressionParams): ProjectionExpression {
    assert(expressionParams.length > 0, "expression params cannot be empty");

    return {
      stringify(stringifyParams) {
        const { names } = stringifyParams;
        const substitutions = [];
        for (const path of expressionParams) {
          substitutions.push(Path.normalize(path).substitute({ names }));
        }
        return substitutions.join(",");
      },
    };
  },
};
