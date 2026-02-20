import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import type { KeySchema } from "../../types.js";
import { AbstractCommand } from "./base.js";
import { CreateTableCodec } from "./codecs/create-table.js";
import type { CreateTableInput } from "./inputs/create-table.js";
import type { CreateTableOutput } from "./outputs/create-table.js";

export class CreateTable<
  KS extends KeySchema = KeySchema,
> extends AbstractCommand<
  CreateTableInput<KS>,
  CreateTableOutput,
  CreateTableCommand
> {
  constructor(input: CreateTableInput<KS>) {
    super({
      input,
      codec: CreateTableCodec,
      command: CreateTableCommand,
    });
  }
}
