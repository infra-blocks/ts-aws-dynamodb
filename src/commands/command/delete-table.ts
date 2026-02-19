import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { DeleteTableCodec } from "./codecs/delete-table.js";
import { AbstractCommand } from "./command.js";
import type { DeleteTableInput } from "./inputs/delete-table.js";
import type { DeleteTableOutput } from "./outputs/delete-table.js";

export class DeleteTable extends AbstractCommand<
  DeleteTableInput,
  DeleteTableOutput,
  DeleteTableCommand
> {
  constructor(input: DeleteTableInput) {
    super({
      input,
      codec: DeleteTableCodec,
      command: DeleteTableCommand,
    });
  }
}
