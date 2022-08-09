import type { WalletName } from "@solana/wallet-adapter-base";
import {
  BaseMessageSignerWalletAdapter,
  WalletNotConnectedError,
  WalletReadyState,
} from "@solana/wallet-adapter-base";
import type { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { sign } from "tweetnacl";

export type BrowserTestWalletAdapterConfig<T extends string> = {
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
  keypair: Keypair;

  constructor(opts: BrowserTestWalletAdapterConfig<T>) {
    super();
    this.keypair = opts.keypair;
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
    this.publicKey = this.keypair.publicKey;
    this.emit("connect", this.keypair.publicKey);
  }

  async disconnect(): Promise<void> {
    this.publicKey = null;
    this.emit("disconnect");
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.connected) {
      throw new WalletNotConnectedError();
    }
    return sign.detached(message, this.keypair.secretKey);
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.connected) {
      throw new WalletNotConnectedError();
    }
    transaction.partialSign(this.keypair);
    return transaction;
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    if (!this.connected) {
      throw new WalletNotConnectedError();
    }
    transactions.forEach((t) => t.partialSign(this.keypair));
    return transactions;
  }
}
