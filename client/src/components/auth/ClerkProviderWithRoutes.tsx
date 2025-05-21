import { ClerkProvider, RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

// Public routes that don't require authentication
const publicPages = ["/", "/try-demo"];

interface ClerkProviderWithRoutesProps {
  children: ReactNode;
}

export function ClerkProviderWithRoutes({ children }: ClerkProviderWithRoutesProps) {
  const [location] = useLocation();
  
  // Check if the current path is public
  const isPublicPage = publicPages.includes(location);
  
  // Get Clerk publishable key from environment
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // Handle app behavior when Clerk key is missing
  useEffect(() => {
    if (!clerkPubKey) {
      console.warn("Clerk publishable key is missing. Authentication will not work properly.");
    }
  }, [clerkPubKey]);

  // For development purposes, if no key is available, still render children
  if (!clerkPubKey) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={{
        elements: {
          // Customize Clerk appearance if needed
          formButtonPrimary: 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600',
          card: 'rounded-xl shadow-md',
        }
      }}
    >
      {isPublicPage ? (
        children
      ) : (
        <>
          <SignedIn>{children}</SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      )}
    </ClerkProvider>
  );
}
