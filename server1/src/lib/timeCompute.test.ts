import { describe, it, expect, vi, afterEach } from "vitest";
import { computeLeftTime } from "./timeCompute";

describe("computeLeftTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("deducts elapsed time from player1 when currentColor matches player1's color", () => {
    const now = 10_000;
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const lastMoveTime = now - 2_000;
    const result = computeLeftTime(lastMoveTime, "white", "white", 60_000, 60_000);

    expect(result).toEqual({ p1: 58_000, p2: 60_000 });
  });

  it("deducts elapsed time from player2 when currentColor differs from player1's color", () => {
    const now = 10_000;
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const lastMoveTime = now - 3_500;
    const result = computeLeftTime(lastMoveTime, "white", "black", 60_000, 60_000);

    expect(result).toEqual({ p1: 60_000, p2: 56_500 });
  });

  it("never returns a negative time, clamping at zero", () => {
    const now = 10_000;
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const lastMoveTime = now - 100_000;
    const result = computeLeftTime(lastMoveTime, "black", "black", 5_000, 5_000);

    expect(result.p1).toBe(0);
    expect(result.p2).toBe(5_000);
  });

  it("returns unchanged times when no time has elapsed", () => {
    const now = 10_000;
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const result = computeLeftTime(now, "white", "white", 30_000, 45_000);

    expect(result).toEqual({ p1: 30_000, p2: 45_000 });
  });
});
