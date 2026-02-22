import assert from "node:assert";
import { type Brand, trusted } from "@infra-blocks/types";
import type { AttributeNames } from "../attributes/names.js";
import { ExpressionFormatter } from "./expression.js";
import { Path, type RawPath } from "./operands/index.js";

export type ProjectionParams = ReadonlyArray<RawPath>;

export type Projection = {
  format(params: { names: AttributeNames }): string;
} & Brand<"Projection">;

export const Projection = {
  /**
   * Constructs a {@link Projection} from the provided {@link ProjectionParams}.
   *
   * Note that an empty expression is an invalid value for the DynamoDB API. To catch this
   * mistake earlier, this function will throw if the provided list of paths is empty.
   *
   * @param expressionParams - The list of paths to include in the projection expression.
   *
   * @returns The {@link Projection} corresponding to the provided {@link ProjectionParams}.
   */
  from(expressionParams: ProjectionParams): Projection {
    assert(expressionParams.length > 0, "expression params cannot be empty");

    return trusted(
      ExpressionFormatter.from((formatterParams) => {
        const { names } = formatterParams;
        const substitutions = [];
        for (const path of expressionParams) {
          substitutions.push(Path.normalize(path).substitute({ names }));
        }
        return substitutions.join(",");
      }),
    );
  },
};
