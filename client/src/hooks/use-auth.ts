import { useUser } from "@clerk/clerk-react";

export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();

  return {
    isLoaded,
    isSignedIn,
    user,
  };
}
