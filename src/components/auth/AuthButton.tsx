import type { ButtonHTMLAttributes } from "react";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function AuthButton({
  children,
  className = "",
  ...props
}: AuthButtonProps) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500 ${className}`}
    >
      {children}
    </button>
  );
}