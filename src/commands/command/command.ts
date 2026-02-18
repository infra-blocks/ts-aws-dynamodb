/** biome-ignore-all lint/suspicious/noExplicitAny: The lib-dynamodb's own types don't compile with their interface.
 * For example, pick any command they offer. None of them are assignable to
 * Parameters<DynamoDBDocumentClient["send"]>[0]. This issue is transitive and makes it very hard to express
 * generic constraints based on their command types, or their client's interface, because they don't work with
 * each other trolololol. Hence, we use any where necessary as an escape hatch to this typing nightmare.
 */

import type {
  DynamoDBDocumentClient,
  DynamoDBDocumentClientCommand,
  DynamoDBDocumentClientResolvedConfig,
} from "@aws-sdk/lib-dynamodb";
import type { Codec } from "./codecs/codec.js";

type DocumentClientCommandCtor<DCI extends object, DCO extends object> = new (
  input: DCI,
) => DynamoDBDocumentClientCommand<
  DCI,
  DCO,
  any,
  any,
  DynamoDBDocumentClientResolvedConfig
>;

// TODO: export outside.
export type CommandOutput<C> = C extends Command<any, infer O, any, any>
  ? O
  : never;
export type CommandInput<C extends Command<any, any, any, any>> = C["input"];

// TODO: don't export outside.
export abstract class Command<
  I extends object,
  O extends object,
  DCI extends object,
  DCO extends object,
> {
  readonly input: I;

  protected readonly codec: Codec<I, O, DCI, DCO>;
  protected readonly command: DocumentClientCommandCtor<DCI, DCO>;

  protected constructor(params: {
    input: I;
    codec: Codec<I, O, DCI, DCO>;
    command: DocumentClientCommandCtor<DCI, DCO>;
  }) {
    const { input, codec, command } = params;
    this.input = input;
    this.codec = codec;
    this.command = command;
  }

  async execute(params: { client: DynamoDBDocumentClient }) {
    const { client } = params;
    return this.codec.decode(
      await client.send(new this.command(this.codec.encode(this.input))),
    );
  }
}
