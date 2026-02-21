import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Attributes, KeyAttributes } from "../types.js";
import { AbstractCommand } from "./base.js";
import { QueryInput } from "./inputs/index.js";
import { QueryOutput } from "./outputs/index.js";

export class Query<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> extends AbstractCommand<QueryInput<K>, QueryOutput<T, K>, QueryCommand> {
  constructor(input: QueryInput<K>) {
    super({
      input,
      codec: {
        encode: QueryInput.encode,
        decode: QueryOutput.decode,
      },
      command: QueryCommand,
    });
  }
}
