import { ConfirmWallet } from "@/utils";
import {
  WalletAdapterNetwork,
  WalletReadyState,
} from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  FakeWalletAdapter,
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Keypair } from "@solana/web3.js";
import type { AppProps } from "next/app";
import { useMemo, useState } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserTestWalletAdapter } from "solana-wallet-adapter-browser-test";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const [keypair] = useState(() => Keypair.generate());
  const wallets = useMemo(
    () => [
      new BrowserTestWalletAdapter({
        name: "TestWallet (Local)",
        keypair,
        readyState: WalletReadyState.Installed,
      }),
      new BrowserTestWalletAdapter({
        name: "ToastConfirmWallet (Local)",
        wallet: new ConfirmWallet(keypair),
        readyState: WalletReadyState.Installed,
      }),
      new FakeWalletAdapter(),
      new PhantomWalletAdapter(),
    ],
    [keypair]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <Component {...pageProps} />
          <Toaster position="bottom-left" />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
