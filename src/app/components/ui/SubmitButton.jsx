"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function SubmitButton({
  children,
  disabled,
  isPending,
  pendingText = "Sauvegarde...",
  className,
}) {
  // const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || isPending}
      className={className}
    >
      {isPending ? (
        <span className="flex items-center justify-center">
          <Spinner variant="circle-filled" /> {" " + pendingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
