import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { SignInModal } from '@/components/auth/SignInModal';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <>
      <header className="sticky top-0 bg-white/80 dark:bg-background/80 backdrop-blur-md z-50 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="text-xl font-bold text-neutral-800 dark:text-white">PromptP</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors">Features</a>
              <a href="#use-cases" className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors">Use Cases</a>
              <a href="#pricing" className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors">Pricing</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isSignedIn ? (
                <Link href="/workspace">
                  <Button variant="default" className="gradient-bg">Go to Workspace</Button>
                </Link>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="hidden md:inline-flex"
                    onClick={() => setSignInModalOpen(true)}
                  >
                    Login
                  </Button>
                  <Button 
                    className="gradient-bg text-white shadow-md hover:shadow-lg"
                    onClick={() => setSignInModalOpen(true)}
                  >
                    Sign Up Free
                  </Button>
                </>
              )}
              <button 
                className="md:hidden text-neutral-600 dark:text-neutral-300"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 h-full w-64 p-5 shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="text-xl font-bold text-neutral-800 dark:text-white">PromptP</span>
              </Link>
              <button className="text-neutral-600 dark:text-neutral-300" onClick={() => setMobileMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors py-2">Features</a>
              <a href="#use-cases" className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors py-2">Use Cases</a>
              <a href="#pricing" className="text-neutral-600 dark:text-neutral-300 hover:text-primary transition-colors py-2">Pricing</a>
              {!isSignedIn && (
                <>
                  <Button 
                    variant="ghost" 
                    className="justify-start px-0"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSignInModalOpen(true);
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    className="mt-4 gradient-bg text-white"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSignInModalOpen(true);
                    }}
                  >
                    Sign Up Free
                  </Button>
                </>
              )}
              {isSignedIn && (
                <Link href="/workspace">
                  <Button className="mt-4 gradient-bg text-white">Go to Workspace</Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      <SignInModal 
        isOpen={signInModalOpen} 
        onClose={() => setSignInModalOpen(false)}
      />
    </>
  );
}
