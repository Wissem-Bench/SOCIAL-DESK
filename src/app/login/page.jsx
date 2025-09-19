"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { signInWithCredentials } from "@/app/lib/actions/auth";
import toast from "react-hot-toast";
import SubmitButton from "@/app/components/ui/SubmitButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // This state will ONLY hold the "Invalid credentials" message
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const { mutate: signInMutation } = useMutation({
    mutationFn: signInWithCredentials,
    onMutate: () => {
      setIsLoading(true); // Set loading true when mutation starts
    },
    onSuccess: (data) => {
      if (data.error) {
        setIsLoading(false);
        // This is a "handled" error returned by our action
        if (data.error.status === 400) {
          setAuthError("L'email ou le mot de passe est incorrect.");
        } else {
          // Another handled error, but not for credentials
          toast.error(data.error.message || "Une erreur est survenue.");
        }
      } else if (data.success) {
        // On success, clear any previous auth errors and navigate
        setAuthError("");
        router.push("/dashboard");
        // router.refresh(); // Crucial for server to recognize the new session
      }
    },
    onError: (error) => {
      // onError will only catch UNEXPECTED errors (network, server crash)
      setIsLoading(false);
      console.error("Login Mutation Unexpected Error:", error);
      toast.error("Un problème de connexion est survenu. Veuillez réessayer.");
    },
  });

  const handleSignIn = (e) => {
    e.preventDefault();
    setAuthError(""); // Clear previous errors on a new attempt
    signInMutation({ email, password });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Se connecter
        </h1>

        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-2">
            {" "}
            {/* Reduced margin-bottom */}
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          {/* Fixed-height container for the error message */}
          <div className="h-6 text-center text-sm text-red-600 mb-4">
            {authError || ""}
          </div>

          <SubmitButton
            isPending={isLoading}
            pendingText="Connexion en cours"
            className={`w-full p-3 rounded-md text-white ${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Se connecter
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte ?{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-600 hover:underline"
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
