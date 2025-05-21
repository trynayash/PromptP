import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/utils/ai-engine";

const roleDescriptions = {
  writer: "Content creators, copywriters, authors, and storytellers",
  designer: "UI/UX designers, graphic artists, and creative directors",
  developer: "Software engineers, coders, and technical builders",
  marketer: "Digital marketers, campaign managers, and growth specialists"
};

const userRoleSchema = z.object({
  role: z.enum(["writer", "designer", "developer", "marketer"])
});

type UserRoleFormValues = z.infer<typeof userRoleSchema>;

export function OnboardingForm() {
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<UserRoleFormValues>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      role: "writer",
    },
  });

  async function onSubmit(data: UserRoleFormValues) {
    if (!isLoaded || !user) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/users/onboarding", {
        userId: user.id,
        role: data.role,
      });
      
      toast({
        title: "Profile updated",
        description: "Your preferences have been saved.",
      });
      
      setLocation("/workspace");
    } catch (error) {
      console.error("Error setting user role:", error);
      toast({
        title: "Something went wrong",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome to PromptP</CardTitle>
        <CardDescription>
          Tell us about your role so we can tailor your prompt enhancement experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>What best describes you?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      {(Object.keys(roleDescriptions) as UserRole[]).map((role) => (
                        <FormItem key={role} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={role} className="peer sr-only" />
                          </FormControl>
                          <div className="flex items-center justify-between w-full p-4 border rounded-lg peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800">
                            <div>
                              <FormLabel className="capitalize font-semibold cursor-pointer">{role}</FormLabel>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {roleDescriptions[role]}
                              </p>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary opacity-0 peer-data-[state=checked]:opacity-100">
                              <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                          </div>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" className="gradient-bg text-white w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Continue to Workspace"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
          You can change your role later from your account settings
        </p>
      </CardFooter>
    </Card>
  );
}
