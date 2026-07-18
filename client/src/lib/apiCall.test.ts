import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");
vi.mock("./refreshAccessToken", () => ({
  refreshAccessToken: vi.fn().mockResolvedValue(true),
}));

const { apiCall } = await import("./apiCall");
const { refreshAccessToken } = await import("./refreshAccessToken");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("apiCall", () => {
  it("issues a request to VITE_SERVER_URL + url with credentials and JSON headers", async () => {
    vi.mocked(axios).mockResolvedValue({ data: { ok: true } });

    const result = await apiCall({ method: "GET", url: "/auth/get-user" });

    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: expect.stringContaining("/auth/get-user"),
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })
    );
    expect(result).toEqual({ ok: true });
  });

  it("triggers a token refresh and returns undefined on a 403 response", async () => {
    vi.mocked(axios).mockRejectedValue({ status: 403 });

    const result = await apiCall({ method: "GET", url: "/protected" });

    expect(refreshAccessToken).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("throws using the server-provided error message for non-403 failures", async () => {
    vi.mocked(axios).mockRejectedValue({
      status: 500,
      response: { data: { message: "Something broke" } },
    });

    await expect(apiCall({ method: "POST", url: "/x", data: {} })).rejects.toThrow("Something broke");
  });
});
