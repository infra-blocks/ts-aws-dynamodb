/** biome-ignore-all lint/suspicious/noExplicitAny: The lib-dynamodb's own types don't compile with their interface.
 * For example, pick any command they offer. None of them are assignable to
 * Parameters<DynamoDBDocumentClient["send"]>[0]. This issue is transitive and makes it very hard to express
 * generic constraints based on their command types, or their client's interface, because they don't work with
 * each other trolololol. Hence, we use any where necessary as an escape hatch to this typing nightmare.
 */

import type {
  CreateTableCommand,
  DeleteTableCommand,
} from "@aws-sdk/client-dynamodb";
import type {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { trusted } from "@infra-blocks/types";
import type { GetOutputType } from "@smithy/types";
import type { Codec } from "./codecs/codec.js";

// Working with a union is simpler than working with the lib-dynamodb's exposed types.
type NativeCommand =
  | DeleteCommand
  | GetCommand
  | CreateTableCommand
  | DeleteTableCommand
  | PutCommand;
type NativeCommandCtor<C extends NativeCommand> = new (input: C["input"]) => C;

export type CommandOutput<C extends Command<unknown, unknown>> = Awaited<
  ReturnType<C["execute"]>
>;
export type CommandInput<C extends Command<unknown, unknown>> = C["input"];

// Not exported.
export type Command<I, O> = {
  readonly input: I;

  execute(params: { client: DynamoDBDocumentClient }): Promise<O>;
};

// Not exported.
export abstract class AbstractCommand<
  I extends object,
  O extends object,
  C extends NativeCommand,
> implements Command<I, O>
{
  readonly input: I;

  protected readonly codec: Codec<I, O, C["input"], GetOutputType<C>>;
  protected readonly command: NativeCommandCtor<C>;

  protected constructor(params: {
    input: I;
    codec: Codec<I, O, C["input"], GetOutputType<C>>;
    command: NativeCommandCtor<C>;
  }) {
    const { input, codec, command } = params;
    this.input = input;
    this.codec = codec;
    this.command = command;
  }

  async execute(params: { client: DynamoDBDocumentClient }) {
    const { client } = params;
    const commandInput: C["input"] = this.codec.encode(this.input);
    const command = new this.command(commandInput);
    const commandOutput = await client.send(command as any);
    return this.codec.decode(trusted(commandOutput));
  }
}
