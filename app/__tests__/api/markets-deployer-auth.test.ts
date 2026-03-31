/**
 * PERC-8332: Tests for nonce+ed25519 deployer wallet-sig auth on POST /api/markets
 *
 * Tests the following cases:
 * 1. Missing nonce/signature → 400
 * 2. Unknown nonce → 401
 * 3. Expired nonce → 401
 * 4. Already-used nonce → 401
 * 5. Signature mismatch → 401
 * 6. Valid nonce+signature → passes auth gate (on-chain check still runs)
 * 7. Bypass header (dev-only) → skips sig check
 */

import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";

// Mock dependencies
jest.mock("@/lib/supabase", () => ({
  getServiceClient: jest.fn(),
  getServerNetwork: jest.fn(() => "devnet"),
}));
jest.mock("@/lib/config", () => ({
  getConfig: jest.fn(() => ({
    rpcUrl: "https://api.devnet.solana.com",
    programId: "FwfBKZXbYr4vTK23bMFkbgKq3npJ3MSDxEaKmq9Aj4Qn",
  })),
}));
jest.mock("@solana/web3.js", () => {
  const actual = jest.requireActual("@solana/web3.js");
  return {
    ...actual,
    Connection: jest.fn(() => ({
      getAccountInfo: jest.fn(() => null), // slab doesn't exist (stops after auth check)
    })),
  };
});

import { getServiceClient } from "@/lib/supabase";

/** Generate a fresh ed25519 keypair for testing */
function genKeypair() {
  const kp = nacl.sign.keyPair();
  return {
    secretKey: kp.secretKey,
    publicKey: new PublicKey(kp.publicKey),
    publicKeyBytes: kp.publicKey,
  };
}

/** Sign a nonce string with a secret key */
function signNonce(nonce: string, secretKey: Uint8Array): string {
  const nonceBytes = Buffer.from(nonce, "utf-8");
  const sig = nacl.sign.detached(nonceBytes, secretKey);
  return Buffer.from(sig).toString("base64");
}

const NONCE = "550e8400-e29b-41d4-a716-446655440000";

describe("POST /api/markets — PERC-8332 deployer auth", () => {
  const kp = genKeypair();
  const deployer = kp.publicKey.toBase58();

  const baseBody = {
    slab_address: "7eubYRwJiQdJgXsw1VdaNQ7YHvHbgChe7wbPNQw74S23",
    mint_address: "So11111111111111111111111111111111111111112",
    deployer,
  };

  function buildMockSupabase(challengeRow: Record<string, unknown> | null, selectError?: unknown) {
    const updateMock = {
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    const selectMock = {
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: challengeRow, error: selectError ?? null }),
      select: jest.fn().mockReturnThis(),
    };
    return {
      from: jest.fn((table: string) => {
        if (table === "market_challenges") {
          return {
            ...selectMock,
            delete: jest.fn(() => ({ lt: jest.fn(() => ({ limit: jest.fn().mockResolvedValue({ error: null }) })) })),
            update: jest.fn(() => updateMock),
          };
        }
        return { insert: jest.fn().mockResolvedValue({ error: { message: "Slab not found" } }) };
      }),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 if nonce is missing", async () => {
    (getServiceClient as jest.Mock).mockReturnValue(buildMockSupabase(null));
    const { POST } = await import("@/app/api/markets/route");
    const req = new Request("http://localhost/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseBody, signature: "dGVzdA==" }),
    });
    // @ts-ignore - NextRequest wraps Request
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/nonce/i);
  });

  it("returns 400 if signature is missing", async () => {
    (getServiceClient as jest.Mock).mockReturnValue(buildMockSupabase(null));
    const { POST } = await import("@/app/api/markets/route");
    const req = new Request("http://localhost/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseBody, nonce: NONCE }),
    });
    // @ts-ignore
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/signature/i);
  });

  it("returns 401 for unknown nonce", async () => {
    (getServiceClient as jest.Mock).mockReturnValue(buildMockSupabase(null));
    const { POST } = await import("@/app/api/markets/route");
    const sig = signNonce(NONCE, kp.secretKey);
    const req = new Request("http://localhost/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseBody, nonce: NONCE, signature: sig }),
    });
    // @ts-ignore
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/invalid|unknown nonce/i);
  });

  it("returns 401 for expired nonce", async () => {
    const pastExpiry = new Date(Date.now() - 1000).toISOString();
    (getServiceClient as jest.Mock).mockReturnValue(
      buildMockSupabase({ nonce: NONCE, deployer, expires_at: pastExpiry, used_at: null })
    );
    const { POST } = await import("@/app/api/markets/route");
    const sig = signNonce(NONCE, kp.secretKey);
    const req = new Request("http://localhost/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseBody, nonce: NONCE, signature: sig }),
    });
    // @ts-ignore
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/expired/i);
  });

  it("returns 401 for already-used nonce", async () => {
    const futureExpiry = new Date(Date.now() + 300_000).toISOString();
    const usedAt = new Date().toISOString();
    (getServiceClient as jest.Mock).mockReturnValue(
      buildMockSupabase({ nonce: NONCE, deployer, expires_at: futureExpiry, used_at: usedAt })
    );
    const { POST } = await import("@/app/api/markets/route");
    const sig = signNonce(NONCE, kp.secretKey);
    const req = new Request("http://localhost/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseBody, nonce: NONCE, signature: sig }),
    });
    // @ts-ignore
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/already used/i);
  });

  it("returns 401 for wrong signature (different key)", async () => {
    const futureExpiry = new Date(Date.now() + 300_000).toISOString();
    (getServiceClient as jest.Mock).mockReturnValue(
      buildMockSupabase({ nonce: NONCE, deployer, expires_at: futureExpiry, used_at: null })
    );
    const { POST } = await import("@/app/api/markets/route");
    // Sign with a different keypair
    const wrongKp = nacl.sign.keyPair();
    const sig = Buffer.from(nacl.sign.detached(Buffer.from(NONCE, "utf-8"), wrongKp.secretKey)).toString("base64");
    const req = new Request("http://localhost/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseBody, nonce: NONCE, signature: sig }),
    });
    // @ts-ignore
    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/signature/i);
  });

  it("passes auth check with valid signature (hits on-chain step after)", async () => {
    const futureExpiry = new Date(Date.now() + 300_000).toISOString();
    const mockSupa = buildMockSupabase({ nonce: NONCE, deployer, expires_at: futureExpiry, used_at: null });
    (getServiceClient as jest.Mock).mockReturnValue(mockSupa);
    const { POST } = await import("@/app/api/markets/route");
    const sig = signNonce(NONCE, kp.secretKey);
    const req = new Request("http://localhost/api/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...baseBody, nonce: NONCE, signature: sig }),
    });
    // @ts-ignore
    const res = await POST(req as any);
    // Should fail with 400 (slab not found on-chain), NOT 401 (auth failure)
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/slab|on-chain/i);
  });

  it("bypass header skips sig check (dev env only)", async () => {
    process.env.MARKETS_AUTH_BYPASS_SECRET = "dev-bypass-secret-123";
    (getServiceClient as jest.Mock).mockReturnValue(buildMockSupabase(null));
    const { POST } = await import("@/app/api/markets/route");
    const req = new Request("http://localhost/api/markets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-markets-bypass": "dev-bypass-secret-123",
      },
      body: JSON.stringify({ ...baseBody }), // no nonce/sig
    });
    // @ts-ignore
    const res = await POST(req as any);
    // Should fail with 400 (slab not found), NOT 400 (missing nonce/sig)
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).not.toMatch(/nonce|signature/i);
    delete process.env.MARKETS_AUTH_BYPASS_SECRET;
  });
});
