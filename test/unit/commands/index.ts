import { suite, test } from "node:test";
import { expectTypeOf } from "@infra-blocks/test";
import type {
  CommandInput,
  CommandOutput,
  CreateTable,
  CreateTableInput,
  CreateTableOutput,
  DeleteItem,
  DeleteItemInput,
  DeleteItemOutput,
  GetItem,
  GetItemInput,
  GetItemOutput,
} from "../../../src/index.js";
import { attributesTests } from "./attributes/index.js";
import { expressionsTests } from "./expressions/index.js";

export const commandsTests = () => {
  suite("commands", () => {
    attributesTests();
    expressionsTests();

    suite("CommandOutput", () => {
      test("should work with DeleteItem", () => {
        expectTypeOf<
          CommandOutput<DeleteItem>
        >().toEqualTypeOf<DeleteItemOutput>();
      });
      test("should work with GetItem", () => {
        expectTypeOf<CommandOutput<GetItem>>().toEqualTypeOf<GetItemOutput>();
      });
      test("should work with CreateTable", () => {
        expectTypeOf<
          CommandOutput<CreateTable>
        >().toEqualTypeOf<CreateTableOutput>();
      });
    });
    suite("CommandInput", () => {
      test("should work with DeleteItem", () => {
        expectTypeOf<
          CommandInput<DeleteItem>
        >().toEqualTypeOf<DeleteItemInput>();
      });
      test("should work with GetItem", () => {
        expectTypeOf<CommandInput<GetItem>>().toEqualTypeOf<GetItemInput>();
      });
      test("should work with GetItem", () => {
        expectTypeOf<
          CommandInput<CreateTable>
        >().toEqualTypeOf<CreateTableInput>();
      });
    });
  });
};
