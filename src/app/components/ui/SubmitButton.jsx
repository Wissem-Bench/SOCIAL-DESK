"use client";

import { Spinner } from "@/app/components/ui/shadcn-io/spinner";

export default function SubmitButton({
  children,
  disabled,
  isPending,
  pendingText = "Sauvegarde...",
  className,
}) {
  return (
    <button
      type="submit"
      disabled={disabled || isPending}
      className={className}
    >
      {isPending ? (
        <span className="flex items-center justify-center">
          {pendingText}
          <Spinner variant="bars" className="ml-2" />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
