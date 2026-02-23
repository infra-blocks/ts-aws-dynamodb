import assert from "node:assert";
import { type Brand, trusted } from "@infra-blocks/types";
import { ExpressionFormatter, type PathFormatter } from "./formatter.js";
import { Path, type PathInput } from "./operands/index.js";

export type ProjectionInput = ReadonlyArray<PathInput>;

export type Projection = PathFormatter & Brand<"Projection">;

export const Projection = {
  /**
   * Constructs a {@link Projection} from the provided {@link ProjectionInput}.
   *
   * Note that an empty expression is an invalid value for the DynamoDB API. To catch this
   * mistake earlier, this function will throw if the provided list of paths is empty.
   *
   * @param input - The list of paths to include in the projection expression.
   *
   * @returns The {@link Projection} corresponding to the provided {@link ProjectionInput}.
   */
  from(input: ProjectionInput): Projection {
    assert(input.length > 0, "expression params cannot be empty");

    return trusted(
      ExpressionFormatter.from(({ names }) => {
        const substitutions = [];
        for (const path of input) {
          substitutions.push(Path.normalize(path).format({ names }));
        }
        return substitutions.join(",");
      }),
    );
  },
};
