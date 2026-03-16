import { suite } from "node:test";
import { consumedCapacityTests } from "./consumed-capacity.js";
import { deleteItemTests } from "./delete-item.js";
import { getItemTests } from "./get-item.js";
import { itemCollectionMetricsTests } from "./item-collection-metrics.js";
import { putItemTests } from "./put-item.js";
import { queryTests } from "./query.js";
import { scanTests } from "./scan.js";
import { updateItemTests } from "./update-item.js";
import { writeTransactionTests } from "./write-transaction.js";

export const outputsTests = () => {
  suite("outputs", () => {
    consumedCapacityTests();
    deleteItemTests();
    getItemTests();
    itemCollectionMetricsTests();
    putItemTests();
    queryTests();
    scanTests();
    updateItemTests();
    writeTransactionTests();
  });
};
