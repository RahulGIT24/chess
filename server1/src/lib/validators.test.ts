import { describe, it, expect } from "vitest";
import { moveValidator } from "./validators";

describe("moveValidator", () => {
  it("accepts a well-formed move without promotion", () => {
    expect(moveValidator({ from: "e2", to: "e4" } as any)).toBe(true);
  });

  it("accepts a well-formed move with a valid promotion piece", () => {
    expect(moveValidator({ from: "e7", to: "e8", promotion: "q" } as any)).toBe(true);
  });

  it("rejects a move with an invalid promotion piece", () => {
    expect(moveValidator({ from: "e7", to: "e8", promotion: "k" } as any)).toBe(false);
  });

  it("rejects a move whose square codes are not 2 characters long", () => {
    expect(moveValidator({ from: "e2e2", to: "e4" } as any)).toBe(false);
  });

  it("rejects a move with a non-string square value", () => {
    expect(moveValidator({ from: 1, to: "e4" } as any)).toBe(false);
  });

  it("accepts an empty object since every field is optional", () => {
    expect(moveValidator({} as any)).toBe(true);
  });
});
