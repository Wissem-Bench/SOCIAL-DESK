"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";
import SubmitButton from "@/app/components/ui/SubmitButton";

export default function Login() {
  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // States for UI feedback
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle incorrect credentials or other auth errors
        setMessage("L'email ou le mot de passe est incorrect.");
        setLoading(false);
      } else if (data.user) {
        // Handle successful login
        setMessage(null);
        setIsSuccess(true);
        router.push("/dashboard");
        // This is crucial to ensure the server recognizes the new session
        router.refresh();
      }
    } catch (error) {
      // Handle unexpected network errors
      console.error("Login Error:", error);
      setMessage("Une erreur réseau est survenue. Veuillez réessayer.");
      setLoading(false);
    } finally {
      // This will run whether the login succeeds or fails
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Se connecter
        </h1>

        <form onSubmit={handleSignIn}>
          {/* Email Input */}
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

          {/* Password Input */}
          <div className="mb-6">
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

          {/* Submit Button */}
          <SubmitButton
            pendingText="Connexion en cours..."
            className={`w-full p-3 rounded-md ${
              loading
                ? "bg-gray-300 text-gray-500"
                : "text-white bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={loading}
            isPending={loading}
          >
            Se connecter
          </SubmitButton>
        </form>

        {/* Message Display */}
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Link to Sign Up page */}
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
