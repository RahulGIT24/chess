import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../constants/methods";

vi.mock("./apiCall", () => ({
  apiCall: vi.fn(),
}));

const { refreshAccessToken } = await import("./refreshAccessToken");
const { apiCall } = await import("./apiCall");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("refreshAccessToken", () => {
  it("calls the refresh-token endpoint with GET and returns true", async () => {
    vi.mocked(apiCall).mockResolvedValue({ ok: true });

    const result = await refreshAccessToken();

    expect(apiCall).toHaveBeenCalledWith({ url: "/auth/refresh-token", data: {}, method: GET });
    expect(result).toBe(true);
  });

  it("returns false when apiCall setup throws synchronously", async () => {
    vi.mocked(apiCall).mockImplementation(() => {
      throw new Error("network down");
    });

    const result = await refreshAccessToken();

    expect(result).toBe(false);
  });
});
