import type { Keypair, Transaction } from "@solana/web3.js";
import tweetnacl from "tweetnacl";

export interface BrowserTestWallet {
  keypair: Promise<Keypair>;

  confirmConnecting: () => Promise<boolean>;

  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  confirmSignMessage: (message: Uint8Array) => Promise<boolean>;
  beforeSignMessage?: (message: Uint8Array) => Promise<void>;
  afterSignMessage?: (message: Uint8Array) => Promise<void>;

  signTransaction: (transaction: Transaction) => Promise<void>;
  confirmSignTransaction: (transaction: Transaction) => Promise<boolean>;
  beforeSignTransaction?: (transaction: Transaction) => Promise<void>;
  afterSignTransaction?: (transaction: Transaction) => Promise<void>;

  signAllTransactions: (transactions: Transaction[]) => Promise<void>;
  confirmSignAllTransactions: (transactions: Transaction[]) => Promise<boolean>;
  beforeSignAllTransactions?: (transactions: Transaction[]) => Promise<void>;
  afterSignAllTransactions?: (transactions: Transaction[]) => Promise<void>;
}

export abstract class BaseBrowserTestWallet implements BrowserTestWallet {
  abstract keypair: Promise<Keypair>;

  signMessage = async (message: Uint8Array) =>
    this.keypair.then((keypair) =>
      tweetnacl.sign.detached(message, keypair.secretKey)
    );
  signTransaction = async (transaction: Transaction) =>
    this.keypair.then((keypair) => transaction.partialSign(keypair));
  signAllTransactions = async (transactions: Transaction[]) =>
    this.keypair.then((keypair) =>
      transactions.forEach((t) => t.partialSign(keypair))
    );

  confirmConnecting: BrowserTestWallet["confirmConnecting"] = async () => true;
  confirmSignMessage: BrowserTestWallet["confirmSignMessage"] = async () =>
    true;
  confirmSignTransaction: BrowserTestWallet["confirmSignTransaction"] =
    async () => true;
  confirmSignAllTransactions: BrowserTestWallet["confirmSignAllTransactions"] =
    async () => true;
}

export class StaticBrowserTestWallet extends BaseBrowserTestWallet {
  keypair: Promise<Keypair>
  constructor(keypair: Keypair) {
    super();
    this.keypair = Promise.resolve(keypair);
  }
}
