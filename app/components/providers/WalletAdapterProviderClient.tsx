"use client";

/**
 * WalletAdapterProviderClient
 *
 * Client-only wallet-adapter provider for universal wallet connect (Phantom, Solflare, Backpack,
 * any Wallet Standard compatible browser extension).
 *
 * Mounted by WalletProvider when NEXT_PUBLIC_PRIVY_APP_ID is not set so that anyone
 * can connect a browser wallet without a Privy account.
 *
 * autoConnect: true — re-connects the last used wallet on page load (standard UX).
 */

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { getConfig } from "@/lib/config";

interface Props {
  children: ReactNode;
}

export const WalletAdapterProviderClient: FC<Props> = ({ children }) => {
  const endpoint = useMemo(() => {
    return getConfig().rpcUrl || "https://api.devnet.solana.com";
  }, []);

  const wallets = useMemo(
    () => [],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletAdapterProviderClient;
