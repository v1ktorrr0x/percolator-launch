"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnectionCompat } from "@/hooks/useWalletCompat";
import { useSlabState } from "@/components/providers/SlabProvider";
import { useUserAccount } from "@/hooks/useUserAccount";
import { isMockMode } from "@/lib/mock-mode";
import { isMockSlab } from "@/lib/mock-trade-data";

const textEncoder = new TextEncoder();

/**
 * Derive the position_nft PDA for a user account.
 * Seeds: ["position_nft", slab_key, user_idx as u16 LE]
 */
function derivePositionNftPda(
  programId: PublicKey,
  slab: PublicKey,
  userIdx: number
): [PublicKey, number] {
  const idxBuf = new Uint8Array(2);
  new DataView(idxBuf.buffer).setUint16(0, userIdx, true); // little-endian u16
  return PublicKey.findProgramAddressSync(
    [textEncoder.encode("position_nft"), slab.toBytes(), idxBuf],
    programId
  );
}

// PositionNft account layout (108+ bytes):
//   [0..8]    magic       u64
//   [8..40]   mint        [u8; 32]
//   [40..72]  slab        [u8; 32]
//   [72..104] owner       [u8; 32]
//   [104..106] user_idx   u16 LE
//   [106]     pending_settlement  u8
//   [107]     bump        u8
const POSITION_NFT_SIZE = 108;

function parsePositionNftAccount(data: Buffer): {
  mint: PublicKey;
  pendingSettlement: boolean;
} {
  if (data.length < POSITION_NFT_SIZE) {
    throw new Error(`PositionNft account too small: ${data.length} < ${POSITION_NFT_SIZE}`);
  }
  const mint = new PublicKey(data.slice(8, 40));
  const pendingSettlement = data[106] !== 0;
  return { mint, pendingSettlement };
}

export interface UsePositionNftResult {
  /** Whether the position NFT has been minted (PDA account exists on-chain) */
  hasMintedNft: boolean;
  /** The NFT mint address (if minted) */
  nftMint: PublicKey | null;
  /** Whether the position is pending settlement */
  pendingSettlement: boolean;
  /** The position_nft PDA address (always available once slab + user loaded) */
  nftPdaAddress: string | null;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook: derives the position_nft PDA for the current user, fetches the
 * account, and parses the NFT mint + settlement flag.
 *
 * PDA seeds: ["position_nft", slab, user_idx_u16_LE]
 * Layout per percolator-nft program (PERC-303).
 */
export function usePositionNft(slabAddress: string): UsePositionNftResult {
  const { connection } = useConnectionCompat();
  const userAccount = useUserAccount();
  const { programId: slabProgramId } = useSlabState();
  const mockMode = isMockMode() && isMockSlab(slabAddress);

  const [state, setState] = useState<UsePositionNftResult>({
    hasMintedNft: false,
    nftMint: null,
    pendingSettlement: false,
    nftPdaAddress: null,
    isLoading: false,
  });

  useEffect(() => {
    if (!userAccount || !slabProgramId || !slabAddress) {
      setState({
        hasMintedNft: false,
        nftMint: null,
        pendingSettlement: false,
        nftPdaAddress: null,
        isLoading: false,
      });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const slabPk = new PublicKey(slabAddress);
        const [nftPda] = derivePositionNftPda(slabProgramId, slabPk, userAccount.idx);
        const pdaStr = nftPda.toBase58();

        if (mockMode) {
          if (!cancelled) {
            setState({
              hasMintedNft: false,
              nftMint: null,
              pendingSettlement: false,
              nftPdaAddress: pdaStr,
              isLoading: false,
            });
          }
          return;
        }

        setState((prev) => ({ ...prev, isLoading: true, nftPdaAddress: pdaStr }));

        const accountInfo = await connection.getAccountInfo(nftPda);

        if (cancelled) return;

        if (!accountInfo || !accountInfo.data || accountInfo.data.length < POSITION_NFT_SIZE) {
          setState({
            hasMintedNft: false,
            nftMint: null,
            pendingSettlement: false,
            nftPdaAddress: pdaStr,
            isLoading: false,
          });
          return;
        }

        const { mint, pendingSettlement } = parsePositionNftAccount(
          Buffer.from(accountInfo.data)
        );

        setState({
          hasMintedNft: true,
          nftMint: mint,
          pendingSettlement,
          nftPdaAddress: pdaStr,
          isLoading: false,
        });
      } catch (e) {
        console.error("[usePositionNft] Error fetching PDA:", e);
        if (!cancelled) {
          setState({
            hasMintedNft: false,
            nftMint: null,
            pendingSettlement: false,
            nftPdaAddress: null,
            isLoading: false,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userAccount, slabProgramId, slabAddress, mockMode, connection]);

  return state;
}
