import { useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { enhancePrompt, EnhancedPrompt, UserRole } from "@/lib/utils/ai-engine";
import { useToast } from "@/hooks/use-toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useTheme } from "@/components/ui/theme-provider";

export default function TryDemo() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [outputPrompt, setOutputPrompt] = useState<EnhancedPrompt | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("writer");
  
  const enhancedTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { copy, isCopied } = useCopyToClipboard();
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Handle the enhancement process
  const handleEnhancePrompt = async () => {
    if (!inputPrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to enhance.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    
    try {
      // Use the client-side algorithm for immediate feedback
      const clientEnhanced = enhancePrompt(inputPrompt, selectedRole);
      setOutputPrompt(clientEnhanced);
      
      toast({
        title: "Prompt enhanced!",
        description: "Your prompt has been successfully enhanced.",
      });
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast({
        title: "Enhancement failed",
        description: "There was an error enhancing your prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Copy enhanced prompt to clipboard
  const handleCopyPrompt = () => {
    if (outputPrompt?.enhanced) {
      copy(outputPrompt.enhanced);
      toast({
        title: "Copied to clipboard",
        description: "Your enhanced prompt is ready to use!"
      });
    }
  };

  // Clear the workspace
  const handleClear = () => {
    setInputPrompt("");
    setOutputPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-neutral-800 dark:text-white">PromptP</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            
            <Button size="icon" variant="ghost" onClick={toggleTheme}>
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </Button>
            
            <Link href="#signin">
              <Button variant="default" className="gradient-bg">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow bg-neutral-50 dark:bg-neutral-900/20 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Try PromptP Demo</h1>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Experience how PromptP enhances your prompts with this interactive demo. 
              No sign-up required!
            </p>
          </div>
          
          {/* Role selector */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium mb-3">Select your role:</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(["writer", "designer", "developer", "marketer"] as UserRole[]).map((role) => (
                  <Button 
                    key={role}
                    variant={selectedRole === role ? "default" : "outline"}
                    className={selectedRole === role ? "gradient-bg" : ""}
                    onClick={() => setSelectedRole(role)}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Input Prompt</CardTitle>
                <CardDescription>
                  Enter your basic prompt to enhance with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Enter your prompt here... (e.g., 'Write about climate change')"
                  className="min-h-[200px] resize-none"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleClear}>Clear</Button>
                <Button 
                  className="gradient-bg text-white"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !inputPrompt.trim()}
                >
                  {isEnhancing ? "Enhancing..." : "Enhance Prompt"}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Output Card */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Prompt</CardTitle>
                <CardDescription>
                  Role-optimized for {selectedRole}s
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  ref={enhancedTextareaRef}
                  placeholder="Your enhanced prompt will appear here..."
                  className="min-h-[200px] resize-none"
                  value={outputPrompt?.enhanced || ""}
                  readOnly
                />
                {outputPrompt && (
                  <div className="flex justify-between mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                    <span>Word count: {outputPrompt.wordCount.enhanced} (+{outputPrompt.wordCount.enhanced - outputPrompt.wordCount.original})</span>
                    <span>Specificity: {outputPrompt.specificity}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <Link href="/">
                    <Button variant="outline">
                      Sign up for more features
                    </Button>
                  </Link>
                </div>
                <Button 
                  className="gradient-bg text-white"
                  onClick={handleCopyPrompt}
                  disabled={!outputPrompt}
                >
                  {isCopied ? "Copied!" : "Copy to Clipboard"}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Before/After Comparison (Only shown when both input and output exist) */}
          {outputPrompt && (
            <div className="mt-8 max-w-6xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Before / After Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm border border-neutral-200 dark:border-neutral-700">
                <div>
                  <h4 className="font-medium text-neutral-800 dark:text-neutral-200 mb-2 flex justify-between">
                    <span>Basic Prompt</span>
                    <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full">Before</span>
                  </h4>
                  <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                    <p className="text-neutral-600 dark:text-neutral-400">{inputPrompt}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-primary-600 dark:text-primary-400 mb-2 flex justify-between">
                    <span>Enhanced Prompt</span>
                    <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">After</span>
                  </h4>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10">
                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-line">{outputPrompt.enhanced}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Demo notice */}
          <div className="mt-12 text-center max-w-xl mx-auto">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              This is a demo version of PromptP with limited functionality. 
              <Link href="/" className="text-primary-600 dark:text-primary-400 ml-1">
                Sign up
              </Link> for the full experience with prompt history, analytics, and more.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}