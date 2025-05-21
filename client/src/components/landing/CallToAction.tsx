import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { SignInModal } from "../auth/SignInModal";

export function CallToAction() {
  const { isSignedIn } = useAuth();
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  return (
    <>
      <section className="py-16 gradient-bg text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Start Prompting Smarter Today</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of creators who are unlocking their full potential with PromptP's AI-powered prompt enhancement.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                className="px-8 py-6 rounded-lg bg-white text-primary-600 shadow-md hover:shadow-xl transition-shadow"
                onClick={() => !isSignedIn && setSignInModalOpen(true)}
              >
                Sign Up Free
              </Button>
              <Button 
                variant="outline" 
                className="px-8 py-6 rounded-lg border border-white text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SignInModal 
        isOpen={signInModalOpen} 
        onClose={() => setSignInModalOpen(false)}
      />
    </>
  );
}
