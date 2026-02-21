import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import type { KeySchema } from "../types.js";
import { AbstractCommand } from "./base.js";
import { CreateTableInput } from "./inputs/index.js";
import { CreateTableOutput } from "./outputs/index.js";

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
      codec: {
        encode: CreateTableInput.encode,
        decode: CreateTableOutput.decode,
      },
      command: CreateTableCommand,
    });
  }
}
