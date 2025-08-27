import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import type { TranslateConfig } from "@aws-sdk/lib-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { Logger } from "@infra-blocks/logger-interface";
import { NullLogger } from "@infra-blocks/null-logger";
import { type Retry, type RetryConfig, retry } from "@infra-blocks/retry";
import {
  CreateTable,
  type CreateTableParams as CreateTableInput,
  type CreateTableOutput,
} from "./commands/create-table.js";
import {
  GetItem,
  type GetItemParams as GetItemInput,
  type GetItemOutput,
} from "./commands/get-item.js";
import {
  PutItem,
  type PutItemInput,
  type PutItemOutput,
} from "./commands/put-item.js";
import { Query, type QueryParams as QueryInput } from "./commands/query.js";
import type { Command } from "./commands/types.js";
import {
  UpdateItem,
  type UpdateItemParams as UpdateItemInput,
  type UpdateItemOutput,
} from "./commands/update-item.js";
import {
  WriteTransaction,
  type WriteTransactionOutput,
  type WriteTransactionParams,
} from "./commands/write-transaction.js";
import { DynamoDbClientError } from "./error.js";
import type { Attributes } from "./types.js";

/**
 * Creation parameters for the {@link DynamoDbClient}.
 */
export type CreateParams = {
  /**
   * The configuration for the vanilly DynamoDB client.
   *
   * When none is provided, the client is instantiated with the default configuration
   * provided by the AWS SDK.
   */
  dynamodb?: DynamoDBClientConfig;
  /**
   * The configuration for the document client.
   *
   * When none is provided, the document client is instantiated with the default
   * configuration provided by the AWS SDK.
   */
  document?: TranslateConfig;
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
   * @param params - The parameters to use to create the table.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html
   */
  createTable(params: CreateTableInput): Promise<CreateTableOutput> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("createTable(%s)", JSON.stringify(params));
    }

    return this.send(CreateTable.from(params));
  }

  /**
   * Gets an item using the GetItem API.
   *
   * @param params - The parameters to use to get the item.
   *
   * @returns The item casted to the generic type provided, or undefined if not such item
   * matches the primary key.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html
   */
  getItem<T>(params: GetItemInput): Promise<GetItemOutput<T>> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("getItem(%s)", JSON.stringify(params));
    }

    return this.send(GetItem.from(params));
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
  putItem(params: PutItemInput): Promise<PutItemOutput> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("putItem(%s)", JSON.stringify(params));
    }

    return this.send(PutItem.from(params));
  }

  /**
   * Queries a table, or an index, using the Query API.
   *
   * Pagination is automatically handled as an async generator, yielding
   * one item at a time.
   *
   * @param params - The parameters to use to query the table or index.
   *
   * @returns An async generator that yields items matching the query, one
   * at a time, and that handles pagination automatically.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
   */
  async *query<T extends Attributes = Attributes>(
    params: QueryInput,
  ): AsyncGenerator<T> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("query(%s)", JSON.stringify(params));
    }

    try {
      let response = await this.client.send(Query.from(params).toAwsCommand());

      for (const item of response.Items || []) {
        yield item as T;
      }

      while (response.LastEvaluatedKey != null) {
        response = await this.client.send(
          Query.from({
            ...params,
            exclusiveStartKey: response.LastEvaluatedKey,
          }).toAwsCommand(),
        );

        for (const item of response.Items || []) {
          yield item as T;
        }
      }
    } catch (err) {
      throw new DynamoDbClientError("error while querying table", {
        cause: err,
      });
    }
  }

  /**
   * Convenience method over the {@link query} method enforcing that the query
   * matches at most one item.
   *
   * If the query doesn't match any item, then `undefined` is returned. If there are
   * matches, then the function throws as soon as a second matching item is returned.
   *
   * @param params - The parameters to use to query the table or index.
   *
   * @returns The only item matching the query, or `undefined` if no item matches.
   */
  async queryOne<T extends Attributes = Attributes>(
    params: QueryInput,
  ): Promise<T | undefined> {
    try {
      let item: T | undefined;
      for await (const queryItem of this.query<T>(params)) {
        if (item != null) {
          throw new DynamoDbClientError(
            "expected one item in query but found at least 2",
          );
        }
        item = queryItem;
      }
      return item;
    } catch (err) {
      // TODO: careful here as email is PII.
      throw new DynamoDbClientError(
        `error while querying one: ${JSON.stringify(params)}`,
        {
          cause: err,
        },
      );
    }
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
   * @param params - The parameters to use to update the item.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html
   */
  updateItem(params: UpdateItemInput): Promise<UpdateItemOutput> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("updateItem(%s)", JSON.stringify(params));
    }

    return this.send(UpdateItem.from(params));
  }

  /**
   * Executes a write transaction using the TransactWriteItems API.
   *
   * @param params - The parameters describing the transaction.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_TransactWriteItems.html
   */
  writeTransaction(
    params: WriteTransactionParams,
  ): Promise<WriteTransactionOutput> {
    if (this.logger.isDebugEnabled()) {
      this.logger.debug("transactWriteItems(%s)", JSON.stringify(params));
    }

    return this.send(WriteTransaction.from(params));
  }

  /**
   * Alias for the {@link putItem} method.
   */
  upsert = this.putItem;

  private async send<Output>(command: Command<Output>): Promise<Output> {
    try {
      return await command.execute(this.client);
    } catch (err) {
      throw new DynamoDbClientError(
        `error executing command ${command.getName()} details: ${JSON.stringify(command.getDetails())}`,
        {
          cause: err,
        },
      );
    }
  }

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
