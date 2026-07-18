import { describe, it, expect } from "vitest";
import { ApiResponse } from "./ApiResponse";

describe("ApiResponse", () => {
  it("assigns statuscode, data and message from the constructor", () => {
    const res = new ApiResponse(200, { id: 1 }, "success");

    expect(res.statuscode).toBe(200);
    expect(res.data).toEqual({ id: 1 });
    expect(res.message).toBe("success");
  });

  it("supports a null data payload", () => {
    const res = new ApiResponse<null>(404, null, "not found");

    expect(res.data).toBeNull();
    expect(res.statuscode).toBe(404);
  });
});
