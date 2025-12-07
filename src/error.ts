// Those are missing the ThrottlingException and the ValidationException mentioned in the documentations.
// They aren't exported by the AWS package at the time of this writing.
export {
  BackupInUseException,
  BackupNotFoundException,
  type BatchStatementError,
  BatchStatementErrorCodeEnum,
  ConditionalCheckFailedException,
  ContinuousBackupsUnavailableException,
  DuplicateItemException,
  ExportConflictException,
  ExportNotFoundException,
  type FailureException,
  GlobalTableAlreadyExistsException,
  GlobalTableNotFoundException,
  IdempotentParameterMismatchException,
  ImportConflictException,
  ImportNotFoundException,
  IndexNotFoundException,
  InternalServerError,
  InvalidEndpointException,
  InvalidExportTimeException,
  InvalidRestoreTimeException,
  ItemCollectionSizeLimitExceededException,
  LimitExceededException,
  PointInTimeRecoveryUnavailableException,
  PolicyNotFoundException,
  ProvisionedThroughputExceededException,
  ReplicaAlreadyExistsException,
  ReplicaNotFoundException,
  ReplicatedWriteConflictException,
  RequestLimitExceeded,
  ResourceInUseException,
  ResourceNotFoundException,
  TableAlreadyExistsException,
  TableInUseException,
  TableNotFoundException,
  TransactionCanceledException,
  TransactionConflictException,
  TransactionInProgressException,
} from "@aws-sdk/client-dynamodb";

export class DynamoDbClientError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DynamoDbClientError";
  }
}
