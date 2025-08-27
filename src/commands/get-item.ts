import {
  type DynamoDBDocumentClient,
  GetCommand,
  type GetCommandInput,
} from "@aws-sdk/lib-dynamodb";
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

export type GetItemOutput<T> = T | undefined;

export class GetItem<T> implements Command<GetItemOutput<T>> {
  private readonly params: GetItemParams;

  private constructor(params: GetItemParams) {
    this.params = params;
  }

  async execute(client: DynamoDBDocumentClient): Promise<GetItemOutput<T>> {
    const response = await client.send(this.toAwsCommand());
    return response.Item as T | undefined;
  }

  getDetails(): object {
    return this.toAwsCommandInput();
  }

  getName(): string {
    return "GetItem";
  }

  private toAwsCommandInput(): GetCommandInput {
    const key = this.params.key;
    return {
      TableName: this.params.table,
      Key: key,
    };
  }

  private toAwsCommand(): GetCommand {
    return new GetCommand(this.toAwsCommandInput());
  }

  static from<T>(params: GetItemParams): GetItem<T> {
    return new GetItem(params);
  }
}
