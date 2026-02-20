import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Attributes, KeyAttributes } from "../../types.js";
import { AbstractCommand } from "./base.js";
import { QueryCodec } from "./codecs/query.js";
import type { QueryInput } from "./inputs/query.js";
import type { QueryOutput } from "./outputs/query.js";

export class Query<
  T extends Attributes = Attributes,
  K extends KeyAttributes = KeyAttributes,
> extends AbstractCommand<QueryInput<K>, QueryOutput<T, K>, QueryCommand> {
  constructor(input: QueryInput<K>) {
    super({
      input,
      codec: QueryCodec,
      command: QueryCommand,
    });
  }
}
