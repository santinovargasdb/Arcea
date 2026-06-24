"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, error, id, ...props },
  ref,
) {
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-wider text-green-mid">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        {...props}
        className="mt-1.5 w-full rounded-lg border border-beige bg-cream px-4 py-2.5 text-sm outline-none transition-colors focus:border-green"
      />
      {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
    </div>
  );
});
