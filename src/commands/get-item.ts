import { GetCommand, type GetCommandInput } from "@aws-sdk/lib-dynamodb";
import type { Attributes } from "../types.js";
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
   * The primary key values of the item to retrieve.
   *
   * This should always include at least the partition key, and the sort key if one
   * is part of the table's primary key. No more than 2 fields are expected here.
   */
  key: Attributes;
}

export class GetItem implements Command<GetCommandInput, GetCommand> {
  private readonly params: GetItemParams;

  private constructor(params: GetItemParams) {
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

  static from(params: GetItemParams): GetItem {
    return new GetItem(params);
  }
}
