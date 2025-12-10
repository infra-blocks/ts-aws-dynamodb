/**
 * Converts a Date object into a TTL value that AWS DynamoDB expects.
 *
 * The TTL value that DynamoDB expects is a Unix epoch timestamp in seconds.
 * This function converts the provided Date object into such a timestamp
 * by doing this: `Math.round(date.getTime() / 1000)`. Nuff said.
 *
 * @param date - The date to convert into a TTL value.
 *
 * @returns The TTL value as expected by AWS DynamoDB.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html
 */
export function dateToTtl(date: Date): number {
  return Math.round(date.getTime() / 1000);
}
