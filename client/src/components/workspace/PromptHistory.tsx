import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface PromptData {
  id: number;
  originalPrompt: string;
  enhancedPrompt: string;
  role: string;
  createdAt: string;
}

interface PromptHistoryProps {
  onUsePrompt: (prompt: PromptData) => void;
}

export function PromptHistory({ onUsePrompt }: PromptHistoryProps) {
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
  const [promptToDelete, setPromptToDelete] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<{ prompts: PromptData[] }>({
    queryKey: ['/api/prompts/history'],
    enabled: isSignedIn,
  });

  const handleDeletePrompt = async (id: number) => {
    setPromptToDelete(id);
    try {
      await apiRequest("DELETE", `/api/prompts/${id}`);
      toast({
        title: "Prompt deleted",
        description: "The prompt has been removed from your history",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the prompt",
        variant: "destructive",
      });
    } finally {
      setPromptToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  if (!isSignedIn) {
    return (
      <Card className="my-8">
        <CardHeader>
          <CardTitle>Prompt History</CardTitle>
          <CardDescription>
            Sign in to access your prompt history
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Create an account to save and access your enhanced prompts
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="my-8">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-6">
              <Skeleton className="h-24 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="my-8">
        <CardHeader>
          <CardTitle>Error Loading History</CardTitle>
          <CardDescription>
            We couldn't load your prompt history
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-red-500 mb-4">
            There was an error retrieving your prompt history. Please try again.
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!data?.prompts || data.prompts.length === 0) {
    return (
      <Card className="my-8">
        <CardHeader>
          <CardTitle>Prompt History</CardTitle>
          <CardDescription>
            You haven't created any prompts yet
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            Your enhanced prompts will appear here once you create them
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="my-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Prompt History</CardTitle>
          <CardDescription>
            Review and reuse your previous enhanced prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.prompts.map((prompt) => (
            <Card key={prompt.id} className="card-hover">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium truncate max-w-lg">
                      {prompt.originalPrompt}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{formatDate(prompt.createdAt)}</span>
                      <span>•</span>
                      <span className="capitalize">{prompt.role}</span>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onUsePrompt(prompt)}
                      className="text-primary-600 dark:text-primary-400"
                    >
                      Use
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeletePrompt(prompt.id)}
                      disabled={promptToDelete === prompt.id}
                      className="text-red-600 dark:text-red-400"
                    >
                      {promptToDelete === prompt.id ? (
                        <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                      ) : null}
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-md text-sm max-h-24 overflow-hidden relative">
                  <p className="text-neutral-700 dark:text-neutral-300 line-clamp-3">
                    {prompt.enhancedPrompt}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 dark:from-neutral-900"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {data.prompts.length} prompt{data.prompts.length !== 1 ? 's' : ''} in your history
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
