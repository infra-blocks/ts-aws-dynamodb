import { GetCommand, type GetCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attribute } from "../types.js";
import type { Command } from "./types.js";

/**
 * The input required to call the GetItem API.
 */

export interface GetItemParams {
  /**
   * The name of the table to query.
   */
  table: string;
  /**
   * The partition key value of the item to retrieve.
   */
  partitionKey: Attribute;
  /**
   * The optional sort key value of the item to retrieve.
   *
   * Note that this is only optional if the table's primary key is made only of the partition key.
   * It's mandatory otherwise.
   */
  sortKey?: Attribute;
}

export class GetItem implements Command<GetCommandInput, GetCommand> {
  private readonly table: string;
  private readonly partitionKey: Attribute;
  private readonly sortKey?: Attribute;

  private constructor(params: GetItemParams) {
    const { table, partitionKey, sortKey } = params;
    this.table = table;
    this.partitionKey = partitionKey;
    this.sortKey = sortKey;
  }

  toAwsCommandInput(): GetCommandInput {
    const key = {
      [this.partitionKey.name]: this.partitionKey.value,
    };
    if (this.sortKey != null) {
      key[this.sortKey.name] = this.sortKey.value;
    }
    return {
      TableName: this.table,
      Key: key,
    };
  }

  toAwsCommand(): GetCommand {
    return new GetCommand(this.toAwsCommandInput());
  }

  static from(params: GetItemParams): GetItem {
    return new GetItem(params);
  }
}
