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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedPrompt, UserRole } from "@/lib/utils/ai-engine";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useTheme } from "@/components/ui/theme-provider";

// Template types available in our custom prompt engine
type TemplateType = "blog" | "technical" | "creative" | "marketing" | "email" | "social" | "presentation" | "product";

// Tone options for the prompt
type ToneType = "professional" | "conversational" | "persuasive" | "instructional" | "inspirational";

// Industry options
type IndustryType = "technology" | "healthcare" | "education" | "finance" | "ecommerce" | "entertainment" | "nonprofit";

export default function TryDemo() {
  const [topic, setTopic] = useState("");
  const [outputPrompt, setOutputPrompt] = useState<EnhancedPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("writer");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("blog");
  const [selectedTone, setSelectedTone] = useState<ToneType>("professional");
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | "">("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const enhancedTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { copy, isCopied } = useCopyToClipboard();
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Handle the prompt generation process
  const handleGeneratePrompt = async () => {
    if (!topic.trim()) {
      toast({
        title: "Empty topic",
        description: "Please enter a topic for your prompt.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Use our custom prompt generation API
      const response = await apiRequest("/api/prompts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic,
          templateType: selectedTemplate,
          role: selectedRole,
          tone: selectedTone,
          industry: selectedIndustry || undefined,
          useEnhancedAlgorithm: false, // Using basic algorithm for demo
          save: false // Not saving prompts for demo users
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate prompt");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOutputPrompt(data.enhancedPrompt);
        
        // Set any additional suggestions if available
        if (data.additionalSuggestions && Array.isArray(data.additionalSuggestions)) {
          setSuggestions(data.additionalSuggestions);
        }
        
        toast({
          title: "Prompt generated!",
          description: "Your prompt has been successfully created and enhanced.",
        });
      } else {
        throw new Error(data.message || "Failed to generate prompt");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "There was an error generating your prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
    setTopic("");
    setOutputPrompt(null);
    setSuggestions([]);
  };
  
  // Handle using a suggested topic
  const handleUseSuggestion = (suggestion: string) => {
    setTopic(suggestion);
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
          
          {/* Configuration panel */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-medium mb-3">Configure your prompt:</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template Type</label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={(value) => setSelectedTemplate(value as TemplateType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Content Templates</SelectLabel>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="technical">Technical Documentation</SelectItem>
                        <SelectItem value="creative">Creative Writing</SelectItem>
                        <SelectItem value="marketing">Marketing Campaign</SelectItem>
                        <SelectItem value="email">Email Template</SelectItem>
                        <SelectItem value="social">Social Media Content</SelectItem>
                        <SelectItem value="presentation">Presentation Outline</SelectItem>
                        <SelectItem value="product">Product Description</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tone</label>
                  <Select
                    value={selectedTone}
                    onValueChange={(value) => setSelectedTone(value as ToneType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Content Tone</SelectLabel>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                        <SelectItem value="instructional">Instructional</SelectItem>
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["writer", "designer", "developer", "marketer"] as UserRole[]).map((role) => (
                      <Button 
                        key={role}
                        variant={selectedRole === role ? "default" : "outline"}
                        className={selectedRole === role ? "gradient-bg" : ""}
                        onClick={() => setSelectedRole(role)}
                        size="sm"
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Industry (Optional)</label>
                  <Select
                    value={selectedIndustry}
                    onValueChange={(value) => setSelectedIndustry(value as IndustryType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Industries</SelectLabel>
                        <SelectItem value="">None</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Topic</CardTitle>
                <CardDescription>
                  Enter the topic you want to create a prompt for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Enter your topic here... (e.g., 'climate change solutions')"
                  className="min-h-[200px] resize-none"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                
                {suggestions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Related Topics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseSuggestion(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleClear}>Clear</Button>
                <Button 
                  className="gradient-bg text-white"
                  onClick={handleGeneratePrompt}
                  disabled={isGenerating || !topic.trim()}
                >
                  {isGenerating ? "Generating..." : "Generate Prompt"}
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