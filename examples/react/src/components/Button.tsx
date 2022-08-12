import type { ForwardedRef, PropsWithChildren } from "react";
import { forwardRef } from "react";

type ButtonProps = Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "disabled" | "onClick"
>;

const Button = (
  props: PropsWithChildren<ButtonProps>,
  ref: ForwardedRef<HTMLButtonElement>
) => {
  const { type, disabled, onClick, children } = props;
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="font-medium rounded text-white px-4 py-2 bg-violet-400 hover:bg-violet-500 active:bg-violet-600 disabled:bg-violet-200 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
};

export default forwardRef(Button);
