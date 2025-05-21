import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { useLocation } from "wouter";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [_, setLocation] = useLocation();

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignIn) {
        if (!signInLoaded) return;
        
        const result = await signIn.create({
          identifier: email,
          password,
        });
        
        if (result.status === "complete") {
          onClose();
          setLocation("/workspace");
        }
      } else {
        if (!signUpLoaded) return;
        
        const result = await signUp.create({
          emailAddress: email,
          password,
          firstName,
          lastName,
        });
        
        if (result.status === "complete") {
          onClose();
          setLocation("/onboarding");
        } else {
          // Handle verification if needed
          // For this example, we'll just close the modal
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      if (isSignIn) {
        if (!signInLoaded) return;
        await signIn.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: "/workspace",
          redirectUrlComplete: "/workspace",
        });
      } else {
        if (!signUpLoaded) return;
        await signUp.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: "/onboarding",
          redirectUrlComplete: "/onboarding",
        });
      }
    } catch (err: any) {
      setError(err.message || `Error signing in with ${provider}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isSignIn ? "Welcome Back" : "Create an Account"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleOAuthSignIn("google")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#EA4335">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.14 16.05c-1.69 1.56-3.88 2.43-6.14 2.43-1.76 0-3.45-.49-4.9-1.42-.31-.2-.35-.66-.07-.91.21-.19.51-.18.74-.04 1.54.77 3.28 1.18 5.07 1.02 2.75-.25 5.17-1.83 6.62-4.28.2-.34.67-.39.96-.1.29.29.25.76-.05 1.04-.63.79-1.39 1.49-2.23 2.06z"></path>
              </svg>
              <span>Continue with Google</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleOAuthSignIn("github")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.218.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.026 1.591 1.026 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
              </svg>
              <span>Continue with GitHub</span>
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignIn && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input 
                    id="firstName" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isSignIn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input 
                    id="lastName" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isSignIn}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isSignIn && (
                  <Button variant="link" className="p-0 h-auto text-xs" type="button">
                    Forgot password?
                  </Button>
                )}
              </div>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {isSignIn && (
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me
                </Label>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            <Button type="submit" className="w-full gradient-bg text-white" disabled={isLoading}>
              {isLoading ? "Loading..." : isSignIn ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          
          <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button variant="link" className="p-0 h-auto" onClick={toggleMode}>
              {isSignIn ? "Sign up" : "Sign in"}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
