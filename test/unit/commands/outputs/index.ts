import { suite } from "node:test";
import { consumedCapacityTests } from "./consumed-capacity.js";
import { deleteItemTests } from "./delete-item.js";
import { getItemTests } from "./get-item.js";
import { putItemTests } from "./put-item.js";

export const outputsTests = () => {
  suite("outputs", () => {
    consumedCapacityTests();
    deleteItemTests();
    getItemTests();
    putItemTests();
  });
};
