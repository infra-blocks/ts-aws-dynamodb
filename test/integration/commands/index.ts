import { suite } from "node:test";
import type { TestKit } from "../kit.js";
import { createTableTests } from "./create-table.js";
import { deleteItemTests } from "./delete-item.js";
import { deleteTableTests } from "./delete-table.js";
import { getItemTests } from "./get-item.js";
import { putItemTests } from "./put-item.js";
import { queryTests } from "./query.js";
import { scanTests } from "./scan.js";
import { updateItemTests } from "./update-item.js";
import { updateTimeToLiveTests } from "./update-time-to-live.js";
import { writeTransactionTests } from "./write-transaction.js";

export const commandsTests = (kit: TestKit) => {
  suite("commands", () => {
    createTableTests(kit);
    deleteItemTests(kit);
    deleteTableTests(kit);
    getItemTests(kit);
    putItemTests(kit);
    queryTests(kit);
    scanTests(kit);
    updateItemTests(kit);
    updateTimeToLiveTests(kit);
    writeTransactionTests(kit);
  });
};
