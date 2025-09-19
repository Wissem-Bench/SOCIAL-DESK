"use client";

import { useMutation } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signOutUser } from "@/app/lib/actions/auth";
import { Spinner } from "@/app/components/ui/shadcn-io/spinner";

export default function LogoutButton() {
  // const router = useRouter();

  const { mutate: logoutMutation, isPending } = useMutation({
    mutationFn: signOutUser,
    onError: (error) => {
      if (error.message.includes("NEXT_REDIRECT")) {
        // This is an expected signal for redirection, not a real error.
        return;
      }
      // Show a toast for any unexpected errors during sign-out
      toast.error(error.message);
    },
  });

  return (
    <button
      onClick={() => logoutMutation()}
      disabled={isPending}
      className="mt-10 px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <span className="flex items-center justify-center">
          Déconnexion
          <Spinner variant="bars" className="ml-2" />
        </span>
      ) : (
        "Se déconnecter"
      )}
    </button>
  );
}
