import { GetCommand, type GetCommandInput } from "@aws-sdk/lib-dynamodb";
import type { KeyAttributes } from "../types.js";
import type { Command } from "./types.js";

/**
 * The input required to call the GetItem API.
 */
export interface GetItemParams<K extends KeyAttributes = KeyAttributes> {
  /**
   * The name of the table to query.
   */
  table: string;
  /**
   * The primary key values of the item to retrieve.
   *
   * This should always include at least the partition key, and the sort key if one
   * is part of the table's primary key. No more than 2 fields are expected here.
   */
  key: K;
}

export class GetItem<K extends KeyAttributes>
  implements Command<GetCommandInput, GetCommand>
{
  private readonly params: GetItemParams<K>;

  private constructor(params: GetItemParams<K>) {
    this.params = params;
  }

  toAwsCommandInput(): GetCommandInput {
    const key = this.params.key;
    return {
      TableName: this.params.table,
      Key: key,
    };
  }

  toAwsCommand(): GetCommand {
    return new GetCommand(this.toAwsCommandInput());
  }

  static from<K extends KeyAttributes>(params: GetItemParams<K>): GetItem<K> {
    return new GetItem(params);
  }
}
