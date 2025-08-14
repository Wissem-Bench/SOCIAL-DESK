"use client";
import { createContext, useContext } from "react";

// Create a context to hold the user session
const UserContext = createContext(undefined);

// The Provider component that will wrap our application
export function UserProvider({ children, user }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

// The custom hook to easily access the user from any client component
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
