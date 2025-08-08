"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import Link from "next/link";

export default function SignUp() {
  // State for all form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // States for UI feedback
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setLoading(true);

    const isValidEmail = (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };

    // --- 1. Frontend Validation ---
    if (password !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setMessage("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }
    if (!fullName.trim()) {
      setMessage("Veuillez entrer votre nom complet.");
      setLoading(false);
      return;
    }
    if (!isValidEmail(email)) {
      setMessage("Veuillez entrer une adresse email valide.");
      setLoading(false);
      return;
    }

    // --- 2. Supabase Sign Up ---
    // we pass the full_name in the options.data object, this will be available in our database trigger
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else if (data.user) {
      setMessage(
        "Inscription réussie ! Veuillez vérifier vos e-mails pour confirmer votre compte."
      );
      setIsSuccess(true);
      // Reset form on success
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Créer votre compte
        </h1>

        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="fullName"
            >
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Ex: Jean Dupont"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
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
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Au moins 8 caractères.</p>
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="confirmPassword"
            >
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Création en cours..." : "Créer le compte"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
        {/* Link to Login page */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
