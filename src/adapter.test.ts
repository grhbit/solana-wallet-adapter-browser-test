import {
  WalletNotConnectedError,
  WalletReadyState,
} from "@solana/wallet-adapter-base";
import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { MemoryWalletAdapter, MemoryWalletName } from "./adapter";

test("init with default config", () => {
  const keypair = Keypair.generate();
  const adapter = new MemoryWalletAdapter({ keypair });

  expect(adapter.keypair).toStrictEqual(keypair);
  expect(adapter.name).toStrictEqual(MemoryWalletName);
  expect(adapter.url).toStrictEqual("/");
  expect(adapter.icon).toStrictEqual("/favicon.ico");
  expect(adapter.readyState).toStrictEqual(WalletReadyState.Loadable);
  expect(adapter.publicKey).toBeNull();
  expect(adapter.connected).toStrictEqual(false);
  expect(adapter.connecting).toStrictEqual(false);
});

test("init with custom config", async () => {
  const keypair = Keypair.generate();
  const name = "Custom WalletName" as const;
  const icon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=";
  const url = "https://thisis.invalid";
  const adapter = new MemoryWalletAdapter({ keypair, name, icon, url });

  expect(adapter.keypair).toStrictEqual(keypair);
  expect(adapter.name).toStrictEqual(name);
  expect(adapter.url).toStrictEqual(url);
  expect(adapter.icon).toStrictEqual(icon);
});

test("connected", async () => {
  const keypair = Keypair.generate();
  const adapter = new MemoryWalletAdapter({ keypair });

  await adapter.connect();

  expect(adapter.readyState).toStrictEqual(WalletReadyState.Loadable);
  expect(adapter.publicKey).toStrictEqual(keypair.publicKey);
  expect(adapter.connected).toStrictEqual(true);
  expect(adapter.connecting).toStrictEqual(false);
});

test("disconnected", async () => {
  const keypair = Keypair.generate();
  const adapter = new MemoryWalletAdapter({ keypair });

  await adapter.connect();
  await adapter.disconnect();

  expect(adapter.readyState).toStrictEqual(WalletReadyState.Loadable);
  expect(adapter.publicKey).toBeNull();
  expect(adapter.connected).toStrictEqual(false);
  expect(adapter.connecting).toStrictEqual(false);
});

test("signMessage fails when not connected", async () => {
  const keypair = Keypair.generate();
  const adapter = new MemoryWalletAdapter({ keypair });

  expect.assertions(1);
  try {
    await adapter.signMessage(Uint8Array.from([]));
  } catch (e) {
    expect(e).toBeInstanceOf(WalletNotConnectedError);
  }
});

test("signTransaction fails when not connected", async () => {
  const keypair = Keypair.generate();
  const adapter = new MemoryWalletAdapter({ keypair });

  expect.assertions(1);
  try {
    await adapter.signTransaction(new Transaction());
  } catch (e) {
    expect(e).toBeInstanceOf(WalletNotConnectedError);
  }
});

test("signAllTransactions fails when not connected", async () => {
  const keypair = Keypair.generate();
  const adapter = new MemoryWalletAdapter({ keypair });

  expect.assertions(1);
  try {
    await adapter.signAllTransactions([new Transaction()]);
  } catch (e) {
    expect(e).toBeInstanceOf(WalletNotConnectedError);
  }
});

test("signMessage success", async () => {
  const keypair = Keypair.fromSeed(
    Uint8Array.from([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0,
    ])
  );
  const adapter = new MemoryWalletAdapter({ keypair });
  await adapter.connect();

  const message = Buffer.from("solana");
  const signedMessage = await adapter.signMessage(message);

  expect(signedMessage).toStrictEqual(
    Uint8Array.from([
      122, 185, 28, 163, 199, 156, 9, 53, 72, 103, 181, 207, 208, 54, 198, 95,
      213, 116, 249, 113, 212, 48, 99, 124, 12, 247, 172, 40, 71, 18, 156, 14,
      132, 73, 72, 6, 231, 139, 54, 28, 153, 210, 14, 4, 98, 160, 0, 12, 48,
      102, 1, 176, 139, 203, 151, 218, 172, 55, 110, 120, 124, 86, 239, 2,
    ])
  );
});

test("sendTransaction success", async () => {
  const keypair = Keypair.generate();
  const adapter = new MemoryWalletAdapter({ keypair });
  await adapter.connect();

  const tx = new Transaction({
    blockhash: PublicKey.default.toBase58(),
    lastValidBlockHeight: 0,
    feePayer: keypair.publicKey,
  }).add(
    new TransactionInstruction({ programId: PublicKey.default, keys: [] })
  );
  await adapter.signTransaction(tx);
});

test("sendAllTransactions success", async () => {
  const keypair = Keypair.generate();
  const adapter = new MemoryWalletAdapter({ keypair });
  await adapter.connect();

  const tx = new Transaction({
    blockhash: PublicKey.default.toBase58(),
    lastValidBlockHeight: 0,
    feePayer: keypair.publicKey,
  }).add(
    new TransactionInstruction({ programId: PublicKey.default, keys: [] })
  );
  await adapter.signAllTransactions([tx]);
});
