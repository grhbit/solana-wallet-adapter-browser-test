import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { StaticBrowserTestWallet } from "solana-wallet-adapter-browser-test";
import ToastConfirm from "./components/ToastConfirm";

export const toastConfirm = async (message?: ReactNode, title?: ReactNode) =>
  new Promise<boolean>((resolve) => {
    toast(
      (t) => (
        <ToastConfirm
          title={title}
          message={message}
          onConfirm={() => {
            toast.dismiss(t.id);
            resolve(true);
          }}
          onCancel={() => {
            toast.dismiss(t.id);
            resolve(false);
          }}
        />
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  });

export class ConfirmWallet extends StaticBrowserTestWallet {
  confirmConnecting = async () =>
    toastConfirm("Connect wallet", "Approval request");
  confirmSignMessage = async (message: Uint8Array) =>
    toastConfirm(
      `Sign Message: \n${Buffer.from(message).toString("utf8")}`,
      "Approval request"
    );
  confirmSignTransaction = async () =>
    toastConfirm("Sign a transaction", "Approval request");
  confirmSignAllTransactions = async () =>
    toastConfirm(`Sign all transactions`, "Approval request");
}
