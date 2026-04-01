import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

async function loadPostHandler() {
  vi.resetModules();

  vi.doMock("@/lib/create-market-rate-limit", () => ({
    CREATE_MARKET_RATE_LIMIT: 5,
    checkLaunchRateLimit: vi.fn().mockResolvedValue({ allowed: true, retryAfterSecs: 0 }),
  }));

  vi.doMock("@/lib/get-client-ip", () => ({
    getClientIp: () => "1.2.3.4",
  }));

  const mod = await import("@/app/api/launch/route");
  return mod.POST as (req: NextRequest) => Promise<Response>;
}

describe("POST /api/launch invalid JSON guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for malformed JSON", async () => {
    const POST = await loadPostHandler();
    const req = new NextRequest("http://localhost/api/launch", {
      method: "POST",
      body: "{",
      headers: { "content-type": "application/json" },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/Invalid JSON body/i);
  });
});
