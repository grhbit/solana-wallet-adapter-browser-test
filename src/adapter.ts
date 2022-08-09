import type { WalletName } from "@solana/wallet-adapter-base";
import {
  BaseMessageSignerWalletAdapter,
  WalletError,
  WalletNotConnectedError,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError
} from "@solana/wallet-adapter-base";
import type { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import type { BrowserTestWallet } from "./wallet";
import { StaticBrowserTestWallet } from "./wallet";

export type BrowserTestWalletAdapterConfig<T extends string> =
  | {
      wallet: BrowserTestWallet;
      name?: T;
      url?: string;
      icon?: string;
    }
  | {
      keypair: Keypair;
      name?: T;
      url?: string;
      icon?: string;
    };

export const BrowserTestWalletName = "BrowserTestWallet (Unsafe)" as const;

export class BrowserTestWalletAdapter<
  T extends string = typeof BrowserTestWalletName
> extends BaseMessageSignerWalletAdapter {
  name: WalletName<T>;
  url: string;
  icon: string;

  publicKey: PublicKey | null = null;
  wallet: BrowserTestWallet;

  constructor(opts: BrowserTestWalletAdapterConfig<T>) {
    super();
    this.wallet =
      "wallet" in opts
        ? opts.wallet
        : new StaticBrowserTestWallet(opts.keypair);
    this.name = (opts.name ?? BrowserTestWalletName) as WalletName<T>;
    this.url = opts.url ?? "/";
    this.icon = opts.icon ?? "/favicon.ico";
  }

  get readyState() {
    return WalletReadyState.Loadable;
  }

  get connecting(): boolean {
    return false;
  }

  async connect(): Promise<void> {
    this.publicKey = this.wallet.keypair.publicKey;
    this.emit("connect", this.wallet.keypair.publicKey);
  }

  async disconnect(): Promise<void> {
    this.publicKey = null;
    this.emit("disconnect");
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      if (!this.connected) {
        throw new WalletNotConnectedError();
      }
      const signedMessage = await this.wallet.signMessage(message);
      if (await this.wallet.confirmSignMessage(signedMessage, message)) {
        return signedMessage;
      }
      throw new WalletSignMessageError("User rejected");
    } catch (error) {
      if (error instanceof WalletError) {
        this.emit("error", error);
      }
      throw error;
    }
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      if (!this.connected) {
        throw new WalletNotConnectedError();
      }
      if (await this.wallet.confirmSignTransaction(transaction)) {
        await this.wallet.beforeSignTransaction?.(transaction);
        await this.wallet.signTransaction(transaction);
        await this.wallet.afterSignTransaction?.(transaction);
        return transaction;
      }
      throw new WalletSignTransactionError("User rejected");
    } catch (error) {
      if (error instanceof WalletError) {
        this.emit("error", error);
      }
      throw error;
    }
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    try {
      if (!this.connected) {
        throw new WalletNotConnectedError();
      }
      if (await this.wallet.confirmSignAllTransactions(transactions)) {
        await this.wallet.beforeSignAllTransactions?.(transactions);
        await this.wallet.signAllTransactions(transactions);
        await this.wallet.afterSignAllTransactions?.(transactions);
        return transactions;
      }
      throw new WalletSignTransactionError("User rejected");
    } catch (error) {
      if (error instanceof WalletError) {
        this.emit("error", error);
      }
      throw error;
    }
  }
}
