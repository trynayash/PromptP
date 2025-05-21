import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { SignInModal } from "../auth/SignInModal";

export function Pricing() {
  const { isSignedIn } = useAuth();
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  return (
    <>
      <section id="pricing" className="py-16 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Choose the plan that fits your creative needs
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="w-full md:w-1/2 bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-2xl font-bold mb-1">Free</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">Perfect for getting started</p>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-1">/month</span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  onClick={() => !isSignedIn && setSignInModalOpen(true)}
                >
                  Sign Up Free
                </Button>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300">10 prompt enhancements per day</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300">Basic prompt history (last 7 days)</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300">Role-based enhancements</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300">Copy and share functionality</span>
                  </li>
                  <li className="flex items-start text-neutral-400 dark:text-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 mr-3">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start text-neutral-400 dark:text-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 mr-3">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span>Custom templates</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="w-full md:w-1/2 bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden border border-primary-300 dark:border-primary-700 relative">
              <div className="absolute top-0 right-0">
                <div className="bg-primary-500 text-white text-xs px-3 py-1 font-medium">
                  POPULAR
                </div>
              </div>
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                <h3 className="text-2xl font-bold mb-1">Pro</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">For serious creators</p>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">$19</span>
                  <span className="text-neutral-500 dark:text-neutral-400 ml-1">/month</span>
                </div>
                <Button 
                  className="w-full gradient-bg text-white"
                  onClick={() => !isSignedIn && setSignInModalOpen(true)}
                >
                  Upgrade to Pro
                </Button>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300"><strong>Unlimited</strong> prompt enhancements</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300">Complete prompt history</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300">Advanced role-based enhancements</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300">Copy, share, and export options</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300">Detailed usage analytics</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-1 mr-3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span className="text-neutral-700 dark:text-neutral-300">Custom template creation</span>
                  </li>
                </ul>
              </div>
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
