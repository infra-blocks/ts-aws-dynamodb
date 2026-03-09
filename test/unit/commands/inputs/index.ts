import { suite } from "node:test";
import { deleteItemTests } from "./delete-item.js";
import { getItemTests } from "./get-item.js";
import { putItemTests } from "./put-item.js";
import { queryTests } from "./query.js";
import { updateItemTests } from "./update-item.js";

export const inputTests = () => {
  suite("inputs", () => {
    deleteItemTests();
    getItemTests();
    putItemTests();
    queryTests();
    updateItemTests();
  });
};
