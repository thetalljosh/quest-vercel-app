"use client";

import { useTransition } from "react";

interface ConfirmButtonProps {
  action: (formData: FormData) => Promise<void>;
  hiddenFields: Record<string, string>;
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}

export function ConfirmButton({
  action,
  hiddenFields,
  confirmMessage,
  className,
  children,
}: ConfirmButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(confirmMessage)) return;

    const formData = new FormData();
    for (const [key, value] of Object.entries(hiddenFields)) {
      formData.append(key, value);
    }

    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {isPending ? "…" : children}
    </button>
  );
}
