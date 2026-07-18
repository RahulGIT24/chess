import { describe, it, expect } from "vitest";
import { minutesToMilliseconds } from "./timeConstants";

describe("minutesToMilliseconds", () => {
  it("converts a '<n> min' style string into milliseconds", () => {
    expect(minutesToMilliseconds("5 min")).toBe(5 * 60 * 1000);
  });

  it("converts a bare number string into milliseconds", () => {
    expect(minutesToMilliseconds("10")).toBe(10 * 60 * 1000);
  });

  it("returns null for an empty string", () => {
    expect(minutesToMilliseconds("")).toBeNull();
  });

  it("returns NaN when the value cannot be parsed as a number", () => {
    expect(minutesToMilliseconds("abc")).toBeNaN();
  });
});
