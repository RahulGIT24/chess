import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "./asyncHandler";

describe("asyncHandler", () => {
  it("invokes the wrapped handler with req, res and next", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
  });

  it("forwards a rejected promise to next()", async () => {
    const error = new Error("boom");
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);
    const next = vi.fn();

    await wrapped({}, {}, next);
    // allow the microtask queue to flush the .catch()
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(error);
  });

  it("does not call next() when the handler resolves successfully", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    const next = vi.fn();

    await wrapped({}, {}, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).not.toHaveBeenCalled();
  });
});
