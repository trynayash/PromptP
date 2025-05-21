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
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

  if (!clerkPubKey) {
    console.warn("Clerk publishable key is missing. Authentication will not work properly.");
  }

  // Get domains for Clerk
  const domain = typeof window !== "undefined" ? window.location.hostname : "";
  const domains = [domain];
  
  // Add both http and https versions
  domains.push(
    `http://${domain}`,
    `https://${domain}`
  );
  
  // Check for Replit domains if available
  const replitDomains = import.meta.env.REPLIT_DOMAINS;
  if (replitDomains && typeof replitDomains === 'string') {
    const splitDomains = replitDomains.split(",");
    // Add each domain with both http and https
    splitDomains.forEach(d => {
      domains.push(
        `http://${d.trim()}`,
        `https://${d.trim()}`
      );
    });
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
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
