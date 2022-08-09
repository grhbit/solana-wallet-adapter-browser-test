import type { Keypair, Transaction } from "@solana/web3.js";
import { sign } from "tweetnacl";

export interface BrowserTestWallet {
  keypair: Keypair;

  confirmConnecting: () => Promise<boolean>;

  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  confirmSignMessage: (
    signedMessage: Uint8Array,
    message: Uint8Array
  ) => Promise<boolean>;

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
  abstract keypair: Keypair;

  confirmConnecting = async () => true;

  signMessage = async (message: Uint8Array) =>
    sign.detached(message, this.keypair.secretKey);
  confirmSignMessage = async () => true;

  signTransaction = async (transaction: Transaction) =>
    transaction.partialSign(this.keypair);
  signAllTransactions = async (transactions: Transaction[]) =>
    transactions.forEach((t) => t.partialSign(this.keypair));

  confirmSignTransaction = async () => true;
  confirmSignAllTransactions = async () => true;
}

export class StaticBrowserTestWallet extends BaseBrowserTestWallet {
  constructor(readonly keypair: Keypair) {
    super();
  }
}
