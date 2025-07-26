"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/client";

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
      } else if (data.user) {
        // Handle successful login
        setMessage("Connexion réussie ! Redirection en cours...");
        setIsSuccess(true);
        router.push("/dashboard");
        // This is crucial to ensure the server recognizes the new session
        router.refresh();
      }
    } catch (error) {
      // Handle unexpected network errors
      console.error("Login Error:", error);
      setMessage("Une erreur réseau est survenue. Veuillez réessayer.");
    } finally {
      // This will run whether the login succeeds or fails
      setLoading(false);
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
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
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
            className="font-medium text-blue-600 hover:underline"
          >
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
