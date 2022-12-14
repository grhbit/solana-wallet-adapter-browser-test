import Button from "@/components/Button";
import WalletMultiButton from "@/components/WalletMultiButton";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BrowserTestWalletAdapter } from "solana-wallet-adapter-browser-test";

const Home: NextPage = () => {
  const {
    signMessage,
    signTransaction,
    signAllTransactions,
    publicKey,
    wallet,
  } = useWallet();
  const { connection } = useConnection();

  const [walletDownload, setWalletDownload] = useState<{
    name: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (wallet?.adapter instanceof BrowserTestWalletAdapter) {
      const adapter = wallet.adapter;
      const fn = () => {
        adapter.wallet.keypair.then((keypair) => {
          const data = Buffer.from(keypair.secretKey).toJSON().data;
          const blob = new Blob([JSON.stringify(data)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          setWalletDownload({
            name: `${keypair.publicKey.toBase58()}.json`,
            url,
          });
        });
      };
      if (adapter.connected) {
        fn();
      } else {
        adapter.once("connect", fn);
      }
    }
    return () =>
      setWalletDownload((download) => {
        if (download?.url) {
          URL.revokeObjectURL(download.url);
        }
        return null;
      });
  }, [wallet]);

  const [balanceUiAmountString, setBalanceUiAmountString] = useState<
    string | null
  >(null);
  const refreshBalance = useCallback(async () => {
    if (publicKey) {
      const balance = await toast.promise(connection.getBalance(publicKey), {
        loading: "Fetching SOL balance",
        error: (err) => err.message || String(err),
        success: "Balance updated!",
      });
      setBalanceUiAmountString((balance / LAMPORTS_PER_SOL).toString(10));
    }
  }, [connection, publicKey]);

  useEffect(() => {
    refreshBalance();
    return () => setBalanceUiAmountString(null);
  }, [publicKey, refreshBalance]);

  const handleRequestAirdrop = useCallback(() => {
    if (publicKey) {
      const fn = async () => {
        const signature = await connection.requestAirdrop(
          publicKey,
          LAMPORTS_PER_SOL / 100
        );
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature,
        });
        refreshBalance();
      };
      toast.promise(fn(), {
        loading: "requesting...",
        error: (err) => err.message || String(err),
        success: "Airdropped!",
      });
    }
  }, [connection, publicKey, refreshBalance]);

  const handleSignMessage = useCallback(() => {
    if (signMessage) {
      const fn = async () => {
        await signMessage(Buffer.from("Solana"));
      };
      toast.promise(fn(), {
        loading: "signing...",
        success: "Message signed!",
        error: (err) => err.message || String(err),
      });
    } else {
      toast.error("Your wallet does not support signMessage.");
    }
  }, [signMessage]);

  const handleSignTransaction = useCallback(() => {
    if (signTransaction) {
      const fn = async () => {
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const tx = new Transaction({
          blockhash,
          lastValidBlockHeight,
          feePayer: publicKey,
        });
        return signTransaction(tx);
      };
      toast.promise(fn(), {
        loading: "signing...",
        success: "Transaction signed!",
        error: (err) => err.message || String(err),
      });
    } else {
      toast.error("Your wallet does not support signTransaction.");
    }
  }, [connection, publicKey, signTransaction]);

  const handleSignAllTransactions = useCallback(() => {
    if (signAllTransactions) {
      const fn = async () => {
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        const tx = new Transaction({
          blockhash,
          lastValidBlockHeight,
          feePayer: publicKey,
        });
        return signAllTransactions([tx]);
      };
      toast.promise(fn(), {
        loading: "signing...",
        success: "All transactions signed!",
        error: (err) => err.message || String(err),
      });
    } else {
      toast.error("Your wallet does not support signAllTransactions.");
    }
  }, [signAllTransactions, connection, publicKey]);

  return (
    <div>
      <Head>
        <title>BrowserTest Wallet Examples</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mt-8">
        <h1 className="font-medium text-4xl">BrowserTest Wallet</h1>

        <div className="inline-flex flex-col gap-2 mt-8">
          <p>RPC: {connection.rpcEndpoint}</p>
          {publicKey !== null && <p>SOL ??? {balanceUiAmountString}</p>}
          <div>
            <WalletMultiButton />
            {walletDownload !== null && (
              <div className="my-4 flex flex-col items-start gap-2 border-4 rounded p-4">
                <p className="font-bold text-sm text-rose-700">
                  You are currently using BrowserTest Wallet.
                  <br />
                  The keypair will be generated when you refresh the page.
                  <br />
                  Please be careful!!
                </p>
                <a
                  className="border rounded px-4 py-2 font-medium text-rose-700 bg-gray-50 hover:bg-gray-100 inline-flex"
                  href={walletDownload.url}
                  download={walletDownload.name}
                >
                  Download Wallet
                </a>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 max-w-xs">
            <Button
              type="button"
              onClick={handleRequestAirdrop}
              disabled={publicKey === null}
            >
              Airdrop 0.01 SOL
            </Button>

            <Button
              type="button"
              onClick={handleSignMessage}
              disabled={publicKey === null}
            >
              Sign Message
            </Button>

            <Button
              type="button"
              onClick={handleSignTransaction}
              disabled={publicKey === null}
            >
              Sign a transaction
            </Button>

            <Button
              type="button"
              onClick={handleSignAllTransactions}
              disabled={publicKey === null}
            >
              Sign all transactions
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
