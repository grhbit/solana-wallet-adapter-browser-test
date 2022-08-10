import type {
  MessageSignerWalletAdapter,
  WalletName,
} from "@solana/wallet-adapter-base";
import {
  BaseMessageSignerWalletAdapter,
  WalletConnectionError,
  WalletError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError,
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
      readyState?: WalletReadyState;
    }
  | {
      keypair: Keypair;
      name?: T;
      url?: string;
      icon?: string;
      readyState?: WalletReadyState;
    };

export const BrowserTestWalletName = "BrowserTestWallet (Unsafe)" as const;

export class BrowserTestWalletAdapter<
    T extends string = typeof BrowserTestWalletName
  >
  extends BaseMessageSignerWalletAdapter
  implements MessageSignerWalletAdapter
{
  name: WalletName<T>;
  url: string;
  icon: string;

  publicKey: PublicKey | null = null;
  wallet: BrowserTestWallet;

  private _connecting: boolean = false;

  constructor(opts: BrowserTestWalletAdapterConfig<T>) {
    super();
    this.wallet =
      "wallet" in opts
        ? opts.wallet
        : new StaticBrowserTestWallet(opts.keypair);
    this.name = (opts.name ?? BrowserTestWalletName) as WalletName<T>;
    this.url = opts.url ?? "/";
    this.icon = opts.icon ?? "/favicon.ico";
    this.readyState = opts.readyState ?? WalletReadyState.Loadable;
  }

  readonly readyState: WalletReadyState;

  get connecting(): boolean {
    return this._connecting;
  }

  async connect(): Promise<void> {
    if (this.connected || this.connecting) {
      return;
    }
    try {
      if (
        this.readyState !== WalletReadyState.Loadable &&
        this.readyState !== WalletReadyState.Installed
      ) {
        throw new WalletNotReadyError();
      }
      this._connecting = true;
      if (await this.wallet.confirmConnecting()) {
        this.publicKey = this.wallet.keypair.publicKey;
        this.emit("connect", this.wallet.keypair.publicKey);
      } else {
        throw new WalletConnectionError("User rejected");
      }
    } catch (error) {
      if (error instanceof WalletError) {
        this.emit("error", error);
      } else {
        this.emit(
          "error",
          new WalletConnectionError((error as any)?.message, error)
        );
      }
      throw error;
    } finally {
      this._connecting = false;
    }
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
      if (await this.wallet.confirmSignMessage(message)) {
        await this.wallet.beforeSignMessage?.(message);
        const signedMessage = await this.wallet.signMessage(message);
        await this.wallet.afterSignMessage?.(message);
        return signedMessage;
      }
      throw new WalletSignMessageError("User rejected");
    } catch (error) {
      if (error instanceof WalletError) {
        this.emit("error", error);
      } else {
        this.emit(
          "error",
          new WalletSignMessageError((error as any)?.message, error)
        );
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
      } else {
        this.emit(
          "error",
          new WalletSignTransactionError((error as any)?.message, error)
        );
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
      } else {
        this.emit(
          "error",
          new WalletSignTransactionError((error as any)?.message, error)
        );
      }
      throw error;
    }
  }
}
