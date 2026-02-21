import assert, { fail } from "node:assert";
import { findCauseByType } from "@infra-blocks/error";
import { ConditionalCheckFailedException } from "../../../src/index.js";

export async function expectConditionCheckFailure(
  func: () => Promise<unknown>,
  expectation: (err: ConditionalCheckFailedException) => void,
) {
  try {
    await func();
    fail("expected conditional check failure");
  } catch (err) {
    const cause = findCauseByType(err, ConditionalCheckFailedException);
    assert(cause != null, "expected conditional check failure");
    expectation(cause);
  }
}
