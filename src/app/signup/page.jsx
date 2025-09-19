"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { signUpUser } from "@/app/lib/actions/auth";
import SubmitButton from "@/app/components/ui/SubmitButton";

export default function SignUp() {
  // State for all form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // States for UI feedback
  const [formMessage, setFormMessage] = useState({
    text: "",
    isSuccess: false,
  });

  const { mutate: signUpMutation, isPending } = useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      setFormMessage({
        text: "Inscription réussie ! Veuillez vérifier vos e-mails pour confirmer votre compte.",
        isSuccess: true,
      });
      // Reset form fields on success
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
    },
    onError: (error) => {
      console.error("Signup Mutation Error:", error);
      // 4. Differentiate errors for display
      if (error.message.includes("déjà utilisée")) {
        // Show validation-like errors inline in the form
        setFormMessage({ text: error.message, isSuccess: false });
      } else {
        // For all other unexpected errors, show a toast
        toast.error("Un problème est survenu. Veuillez réessayer.");
        setFormMessage({ text: "", isSuccess: false }); // Clear any old form messages
      }
    },
  });

  const handleSignUp = (e) => {
    e.preventDefault();
    setFormMessage({ text: "", isSuccess: false });

    // --- 1. Frontend Validation ---
    if (!fullName.trim()) {
      setFormMessage({
        text: "Veuillez entrer votre nom complet.",
        isSuccess: false,
      });
      return;
    }
    const isValidEmail = (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };
    if (!isValidEmail(email)) {
      setFormMessage({
        text: "Veuillez entrer une adresse email valide.",
        isSuccess: false,
      });
      return;
    }
    if (password !== confirmPassword) {
      setFormMessage({
        text: "Les mots de passe ne correspondent pas.",
        isSuccess: false,
      });
      return;
    }
    if (password.length < 8) {
      setFormMessage({
        text: "Le mot de passe doit contenir au moins 8 caractères.",
        isSuccess: false,
      });
      return;
    }

    signUpMutation({ email, password, fullName });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Créer votre compte
        </h1>

        <form onSubmit={handleSignUp} noValidate>
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
            />
          </div>

          <div className="h-6 text-center text-sm mb-4">
            {formMessage.text && (
              <p
                className={
                  formMessage.isSuccess ? "text-green-600" : "text-red-600"
                }
              >
                {formMessage.text}
              </p>
            )}
          </div>

          <SubmitButton
            pendingText="Création en cours..."
            className={`w-full p-3 rounded-md ${
              isPending
                ? "bg-gray-300 text-gray-500"
                : "text-white bg-indigo-600 hover:bg-indigo-700"
            }`}
            disabled={isPending}
            isPending={isPending}
          >
            Créer le compte
          </SubmitButton>
        </form>
        {/* Link to Login page */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
