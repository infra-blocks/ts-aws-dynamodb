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

describe("commands.command", () => {
  describe("CommandOutput", () => {
    it("should work with DeleteItem", () => {
      expectTypeOf<
        CommandOutput<DeleteItem>
      >().toEqualTypeOf<DeleteItemOutput>();
    });
    it("should work with GetItem", () => {
      expectTypeOf<CommandOutput<GetItem>>().toEqualTypeOf<GetItemOutput>();
    });
    it("should work with CreateTable", () => {
      expectTypeOf<
        CommandOutput<CreateTable>
      >().toEqualTypeOf<CreateTableOutput>();
    });
  });
  describe("CommandInput", () => {
    it("should work with DeleteItem", () => {
      expectTypeOf<CommandInput<DeleteItem>>().toEqualTypeOf<DeleteItemInput>();
    });
    it("should work with GetItem", () => {
      expectTypeOf<CommandInput<GetItem>>().toEqualTypeOf<GetItemInput>();
    });
    it("should work with GetItem", () => {
      expectTypeOf<
        CommandInput<CreateTable>
      >().toEqualTypeOf<CreateTableInput>();
    });
  });
});
