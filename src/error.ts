import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import { findCauseByType } from "@infra-blocks/error";
import type { QueryParams } from "./commands/query.js";

export class TooManyItemsException extends Error {
  readonly operation: "queryOne";
  readonly name: "TooManyItemsException";

  private constructor(message: string) {
    super(message);
    this.operation = "queryOne";
    this.name = "TooManyItemsException";
  }

  static queryingOne(params: QueryParams): TooManyItemsException {
    const { table, index } = params;

    return new TooManyItemsException(
      `found multiple items while querying one on ${JSON.stringify({ table, index })}`,
    );
  }
}

export type TransactionCanceledCheck = {
  index: number;
  code: string;
};

export type TransactionCanceledCheckBuilder = {
  atIndex(index: number): TransactionCanceledCheck;
};

export const ConditionalCheckFailed: TransactionCanceledCheckBuilder = {
  atIndex(index: number): TransactionCanceledCheck {
    return { index, code: "ConditionalCheckFailed" };
  },
};

/**
 * Returns whether the provided error is *caused* by a {@link TransactionCanceledException}
 * with the given code at the given index as cancellation reason.
 *
 * It first starts by looking for a {@link TransactionCanceledException} in the causal chain
 * using {@link @infra-blocks/error#findCauseByType}. If none is found, it returns false.
 * If one is found, it returns whether the cancellation reason at the given index
 * matches the given code.
 *
 * @param err - The error to inspect.
 * @param params.index - The index amongst the cancellation reasons to inspect.
 * @param params.code - The code to match against.
 *
 * @returns Whether the error is caused by a {@link TransactionCanceledException}
 *          with the given code at the given index as cancellation reason.
 */
export function isTransactionCanceledBy(
  err: unknown,
  params: TransactionCanceledCheck,
): boolean {
  const { index, code } = params;
  const transactionError = findCauseByType(err, TransactionCanceledException);
  if (transactionError == null) {
    return false;
  }
  return transactionError.CancellationReasons?.[index].Code === code;
}
