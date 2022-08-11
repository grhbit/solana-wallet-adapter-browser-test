import type { ReactNode } from "react";

export type ToastConfirmProps = {
  visible?: boolean;
  title?: ReactNode;
  message?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

const ToastConfirm = (props: ToastConfirmProps) => {
  const { title, message, onConfirm, onCancel } = props;
  return (
    <div className="flex flex-col gap-2">
      {title && <div className="font-bold text-lg">{title}</div>}
      {message}
      <div className="flex gap-2">
        <button
          type="button"
          className="font-medium rounded bg-indigo-100 px-4 py-2 text-indigo-600 hover:bg-indigo-200"
          onClick={onConfirm}
        >
          Confirm
        </button>
        <button
          type="button"
          className="font-medium rounded px-4 py-2 text-gray-900 hover:text-gray-600 hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ToastConfirm;
