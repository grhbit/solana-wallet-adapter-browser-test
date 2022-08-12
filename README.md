# BrowserTest Wallet _(solana-wallet-adapter-browser-test)_

A solana wallet adapter for testing on browser.

[Demo](https://grhbit.github.io/solana-wallet-adapter-browser-test/)

## Install

```sh
$ yarn add solana-wallet-adapter-browser-test
```

## Usage

```typescript
import { useMemo } from "react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import {
  BrowserTestWalletAdapter,
  StaticBrowserTestWallet,
} from "solana-wallet-adapter-browser-test";

const App = (props) => {
  const { children } = props;
  const wallets = useMemo(
    () => [
      // Do not use this wallet adapter on production.
      ...(process.env.NODE_ENV === "production"
        ? []
        : [
            new BrowserTestWalletAdapter({
              keypair: Keypair.generate(),
            }),
            new BrowserTestWalletAdapter({
              name: "Another BrowserTest Wallet",
              wallet: new StaticBrowserTestWallet(Keypair.genrate()),
            }),
          ]),
    ],
    []
  );
  return <WalletProvider wallets={wallets}>{children}</WalletProvider>;
};
```

## License

[MIT](./LICENSE) &copy; Gwon Seonggwang
