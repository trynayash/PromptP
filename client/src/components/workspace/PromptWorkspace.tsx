import { useState, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { enhancePrompt, EnhancedPrompt, UserRole } from "@/lib/utils/ai-engine";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PromptHistory } from "./PromptHistory";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export function PromptWorkspace() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [outputPrompt, setOutputPrompt] = useState<EnhancedPrompt | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState("enhance");
  
  const enhancedTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { copy, isCopied } = useCopyToClipboard();

  // Get user role from backend
  const { data: userData } = useQuery<{ role: UserRole }>({
    queryKey: ['/api/users/me'],
    enabled: isLoaded && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const userRole = userData?.role || "writer";

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
      // First, use the client-side algorithm for immediate feedback
      const clientEnhanced = enhancePrompt(inputPrompt, userRole);
      setOutputPrompt(clientEnhanced);
      
      // Then, send to server for processing and storage
      if (user) {
        const response = await apiRequest("POST", "/api/prompts/enhance", {
          originalPrompt: inputPrompt,
          enhancedPrompt: clientEnhanced.enhanced,
          role: userRole,
        });
        
        // Update any changed data from server
        if (response.ok) {
          // Invalidate prompt history query to show the new prompt
          queryClient.invalidateQueries({ queryKey: ['/api/prompts/history'] });
        }
      }
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

  // Save the prompt
  const handleSavePrompt = async () => {
    if (!user || !outputPrompt) return;

    try {
      await apiRequest("POST", "/api/prompts/save", {
        originalPrompt: inputPrompt,
        enhancedPrompt: outputPrompt.enhanced,
        role: userRole,
      });
      
      toast({
        title: "Prompt saved",
        description: "Your prompt has been saved to your history.",
      });
      
      // Refresh the prompt history
      queryClient.invalidateQueries({ queryKey: ['/api/prompts/history'] });
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving your prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="enhance" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="enhance">Enhance Prompts</TabsTrigger>
          <TabsTrigger value="history">Prompt History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enhance" className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  Role-optimized for {userRole}s
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
                <Button 
                  variant="outline" 
                  onClick={handleSavePrompt}
                  disabled={!outputPrompt || !user}
                >
                  Save
                </Button>
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
            <div className="mt-8">
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
        </TabsContent>
        
        <TabsContent value="history">
          <PromptHistory onUsePrompt={(prompt) => {
            setInputPrompt(prompt.originalPrompt);
            setOutputPrompt({
              original: prompt.originalPrompt,
              enhanced: prompt.enhancedPrompt,
              wordCount: {
                original: prompt.originalPrompt.split(/\s+/).filter(Boolean).length,
                enhanced: prompt.enhancedPrompt.split(/\s+/).filter(Boolean).length
              },
              specificity: "high" // Just a placeholder, would be calculated properly
            });
            setActiveTab("enhance");
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
