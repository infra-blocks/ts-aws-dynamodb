import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import type { TranslateConfig } from "@aws-sdk/lib-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { Logger } from "@infra-blocks/logger-interface";
import { NullLogger } from "@infra-blocks/null-logger";
import { type Retry, type RetryConfig, retry } from "@infra-blocks/retry";
import { trusted } from "@infra-blocks/types";
import type { DynamoDbClientCommand } from "./commands/command/commands.js";
import {
  type CommandOutput,
  CreateTable,
  type CreateTableInput,
  type CreateTableOutput,
  DeleteItem,
  type DeleteItemInput,
  type DeleteItemOutput,
  DeleteTable,
  type DeleteTableInput,
  type DeleteTableOutput,
  GetItem,
  type GetItemInput,
  type GetItemOutput,
  PutItem,
  type PutItemInput,
  type PutItemOutput,
  Query,
  type QueryInput,
  type QueryOutput,
  UpdateItem,
  type UpdateItemInput,
} from "./commands/index.js";
import {
  UpdateTimeToLive,
  type UpdateTimeToLiveParams,
} from "./commands/update-time-to-live.js";
import {
  WriteTransaction,
  type WriteTransactionParams,
} from "./commands/write-transaction.js";
import { TooManyItemsException } from "./error.js";
import type { Attributes, KeyAttributes, KeySchema } from "./types.js";

/**
 * Re-export of the native client's, renamed.
 */
export type DynamoDbClientConfig = DynamoDBClientConfig;

/**
 * Re-export of the document client's {@link TranslateConfig}, renamed.
 */
export type DocumentClientConfig = TranslateConfig;

/**
 * Creation parameters for the {@link DynamoDbClient}.
 */
export type CreateParams = {
  /**
   * The configuration for the vanilla DynamoDB client.
   *
   * When none is provided, the client is instantiated with the default configuration
   * provided by the AWS SDK.
   */
  dynamodb?: DynamoDbClientConfig;
  /**
   * The configuration for the document client.
   *
   * When none is provided, the document client is instantiated with the default
   * configuration provided by the AWS SDK.
   */
  document?: DocumentClientConfig;
  /**
   * Optional logger to use for logging.
   *
   * When none is provided, a {@link NullLogger} is used, which logs into the void.
   */
  logger?: Logger;
};

/**
 * Wrapper class around the {@link DynamoDBDocumentClient} that provides added functionality,
 * safer types and some convenience methods.
 */
export class DynamoDbClient {
  private readonly client: DynamoDBDocumentClient;
  private readonly logger: Logger;

  private constructor(params: {
    client: DynamoDBDocumentClient;
    logger: Logger;
  }) {
    const { client, logger } = params;
    this.client = client;
    this.logger = logger;
  }

  /**
   * Creates a table using the CreateTable API.
   *
   * @param input - The parameters to use to create the table.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html
   */
  async createTable<KS extends KeySchema>(
    input: CreateTableInput<KS>,
  ): Promise<CreateTableOutput> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("createTable(%s)", JSON.stringify(input));
    }

    return this.send(new CreateTable<KS>(input));
  }

  /**
   * Deletes an item using the DeleteItem API.
   *
   * @param input
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html
   */
  deleteItem<
    T extends Attributes = Attributes,
    K extends KeyAttributes = KeyAttributes,
  >(input: DeleteItemInput<K>): Promise<DeleteItemOutput<T>> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("deleteItem(%s)", JSON.stringify(input));
    }

    return this.send(new DeleteItem<T, K>(input));
  }

  /**
   * Deletes a table using the DeleteTable API.
   *
   * @param input - The parameters to use to delete the table.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteTable.html
   */
  async deleteTable(input: DeleteTableInput): Promise<DeleteTableOutput> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("deleteTable(%s)", JSON.stringify(input));
    }

    return this.send(new DeleteTable(input));
  }

  /**
   * Gets an item using the GetItem API.
   *
   * @param input - The parameters to use to get the item.
   *
   * @returns The item casted to the generic type provided, or undefined if not such item
   * matches the primary key.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html
   */
  async getItem<
    T extends Attributes = Attributes,
    K extends KeyAttributes = KeyAttributes,
  >(input: GetItemInput<K>): Promise<GetItemOutput<T>> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("getItem(%s)", JSON.stringify(input));
    }

    return this.send(new GetItem<T, K>(input));
  }

  /**
   * Puts an item using the PutItem API.
   *
   * Refer to the API documentation for more details on how it works. Basically, without
   * conditions, this function will either insert a new document or *replace* the existing
   * one with whatever attributes are provided.
   *
   * @param params - The parameters to use to put the item.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html
   */
  putItem<T extends Attributes = Attributes>(
    params: PutItemInput<T>,
  ): Promise<PutItemOutput<T>> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("putItem(%s)", JSON.stringify(params));
    }

    return this.send(new PutItem<T>(params));
  }

  // TODO: make an IterateQuery command/ free floating function function?
  /**
   * Iterates the items produced querying a table, or an index, using the Query API.
   *
   * It uses {@link paginateQuery} to handle pagination automatically, and yields
   * every item produced by every page.
   *
   * @param input - The parameters to use to query the table or index.
   *
   * @returns An async generator that yields items matching the query, one
   * at a time, and that handles pagination automatically.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
   */
  async *iterateQuery<
    T extends Attributes = Attributes,
    K extends KeyAttributes = KeyAttributes,
  >(input: QueryInput<K>): AsyncGenerator<T> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("iterateQuery(%s)", JSON.stringify(input));
    }

    for await (const page of this.paginateQuery<T, K>(input)) {
      for (const item of page.items) {
        yield item;
      }
    }
  }

  /**
   * Paginates the result of querying a table, or an index, using the Query API.
   *
   * It uses {@link query} to produce pages, and yields them one after the other
   * through the generator.
   *
   * @param input - The parameters to use to query the table or index.
   *
   * @returns An async generator that yields items matching the query, one
   * at a time, and that handles pagination automatically.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
   */
  async *paginateQuery<
    T extends Attributes = Attributes,
    K extends KeyAttributes = KeyAttributes,
  >(input: QueryInput<K>): AsyncGenerator<QueryOutput<T, K>> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("paginateQuery(%s)", JSON.stringify(input));
    }

    let page = await this.query<T, K>(input);
    yield page;

    while (page.lastEvaluatedKey != null) {
      page = await this.query({
        ...input,
        exclusiveStartKey: page.lastEvaluatedKey,
      });

      yield page;
    }
  }

  /**
   * Queries a table, or an index, using the Query API.
   *
   * It produces a single page of results, which may or may not contain all the
   * items of the query. If the result is incomplete, the {@link QueryOutput.lastEvaluatedKey}
   * will be set, and should be used in a follow up query as the {@link QueryOutput.exclusiveStartKey}.
   *
   * @param input - The parameters to use to query the table or index.
   *
   * @returns An async generator that yields items matching the query, one
   * at a time, and that handles pagination automatically.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
   */
  query<
    T extends Attributes = Attributes,
    K extends KeyAttributes = KeyAttributes,
  >(input: QueryInput<K>): Promise<QueryOutput<T, K>> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("query(%s)", JSON.stringify(input));
    }

    return this.send(new Query<T, K>(input));
  }

  /**
   * Convenience method over the {@link query} method enforcing that the query
   * matches at most one item.
   *
   * If the query doesn't match any item, then `undefined` is returned. If there are
   * matches, then the function enforces there is only one.
   *
   * Otherwise, it throws a custom exception of type {@link TooManyItemsException}.
   *
   * This query can be useful in conjunction with an index, where the key is not guaranteed
   * to be unique, unlike `getItem` for the table. It can also be useful in the case where
   * the sort key of an item is unknown, expected to match a {@link KeyConditionExpression} uniquely.
   *
   * @param input - The parameters to use to query the table or index.
   *
   * @returns The only item matching the query, or `undefined` if no item matches.
   */
  async queryOne<
    T extends Attributes = Attributes,
    K extends KeyAttributes = KeyAttributes,
  >(input: QueryInput<K>): Promise<T | undefined> {
    let item: T | undefined;
    // TODO: page of only 2 items, remove limit from parameters.
    for await (const queryItem of this.iterateQuery<T, K>(input)) {
      if (item != null) {
        throw TooManyItemsException.queryingOne(input);
      }
      item = queryItem;
    }
    return item;
  }

  /**
   * Awaits until the DynamoDB service is ready to accept requests.
   *
   * This is mostly useful in local and test environments, where DynamoDB might be started as a docker container.
   * This function uses the {@link @infra-blocks/retry} with its default configuration. If the user wishes
   * to change those, they can do so by passing the `options` parameter that is simply forwarded to the
   * library.
   *
   * @param options - Options to pass to the underlying retry mechanism.
   */
  ready(options?: Omit<RetryConfig, "isRetryableError">): Retry<void> {
    return retry(
      async () => {
        await this.client.send(new ListTablesCommand({}));
      },
      {
        ...options,
        isRetryableError: (err: Error) => {
          if ("code" in err) {
            return err.code === "ECONNRESET";
          }
          return false;
        },
      },
    );
  }

  // TODO: without branding, one type equals all types...
  async send<C extends DynamoDbClientCommand>(
    command: C,
  ): Promise<CommandOutput<C>> {
    return trusted(command.execute({ client: this.client }));
  }

  /**
   * Updates an item using the UpdateItem API.
   *
   * This API *updates* or create an item. In contrast to the {@link putItem} method,
   * if the item already exists, updates do not replace the entire item, but rather
   * apply the requested update actions to the existing item. Refer to the API
   * documentation for more details.
   *
   * In this design, the `params.update` is a list of {@link UpdateAction}s that
   * can be constructed using the provided factory methods, such as {@link assign}.
   *
   * @param input - The parameters to use to update the item.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html
   */
  async updateItem<K extends KeyAttributes = KeyAttributes>(
    input: UpdateItemInput<K>,
  ): Promise<void> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("updateItem(%s)", JSON.stringify(input));
    }

    await this.send(new UpdateItem<K>(input));
  }

  /**
   * Updates the time to live settings of a table using the UpdateTimeToLive API.
   *
   * @param params - The parameters to use to update the time to live settings.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateTimeToLive.html
   */
  async updateTimeToLive(params: UpdateTimeToLiveParams): Promise<void> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("updateTimeToLive(%s)", JSON.stringify(params));
    }

    const command = UpdateTimeToLive.from(params);
    await this.client.send(command.toAwsCommand());
  }

  /**
   * Executes a write transaction using the TransactWriteItems API.
   *
   * @param params - The parameters describing the transaction.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html
   */
  async writeTransaction(params: WriteTransactionParams): Promise<void> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("transactWriteItems(%s)", JSON.stringify(params));
    }

    await this.client.send(WriteTransaction.from(params).toAwsCommand());
  }

  /**
   * Alias for the {@link putItem} method.
   */
  upsert = this.putItem;

  /**
   * Creates an instance of the {@link DynamoDbClient} wrapping the provided document
   * client directly.
   *
   * This is useful when the user has already created a document client, or when the document
   * client is a mock for testing purposes. Otherwise, {@link DynamoDbClient.create} should be
   * preferred.
   *
   * @param params - The creation parameters.
   *
   * @returns A new instance of the {@link DynamoDbClient} wrapping the provided document client.
   */
  static from(params: {
    client: DynamoDBDocumentClient;
    logger?: Logger;
  }): DynamoDbClient {
    const { client, logger = NullLogger.create() } = params;
    return new DynamoDbClient({ client, logger });
  }

  /**
   * Creates an instance of the {@link DynamoDbClient} using the provided parameters.
   *
   * The client is a wrapper around the {@link DynamoDBDocumentClient} from the `@aws-sdk/lib-dynamodb`
   * package, which is itself a wrapper around the {@link DynamoDBClient} from the
   * `@aws-sdk/client-dynamodb` package.
   *
   * This factory function first intantiates the vanilla client with optionally provided
   * configuration, then wraps it in a {@link DynamoDBDocumentClient} that can also
   * be configured. When no configuration is used, both clients are created using their
   * respective default configuration.
   *
   * The DynamoDB vanilla client can be configured using the `dynamodb` parameter,
   * The document client can be configured using the `document` parameter,
   *
   * The `logger` parameter is optional and defaults to a {@link NullLogger}.
   *
   * The user also has the option to create and configure the document client outside of this code
   * and use the {@link DynamoDbClient.from} method wrap it with a fresh instance of this class.
   *
   * @param params - The creation parameters.
   *
   * @returns A new instance of the {@link DynamoDbClient}.
   */
  static create(params?: CreateParams): DynamoDbClient {
    const p = params || {};
    const { logger } = p;
    const dynamodb = new DynamoDBClient(p.dynamodb || {});
    const client = DynamoDBDocumentClient.from(dynamodb, p.document);
    return DynamoDbClient.from({ client, logger });
  }
}
