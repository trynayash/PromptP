import { useState } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AccountSettings() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: userData, refetch } = useQuery<{ role: string, plan: string }>({
    queryKey: ['/api/users/me'],
    enabled: isLoaded && !!user,
  });

  const [selectedRole, setSelectedRole] = useState<string | undefined>(userData?.role);

  // Update role when data is loaded
  if (userData?.role && !selectedRole) {
    setSelectedRole(userData.role);
  }

  const handleRoleChange = async (role: string) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await apiRequest("POST", "/api/users/onboarding", {
        userId: user.id,
        role,
      });
      
      toast({
        title: "Role updated",
        description: "Your role preference has been updated",
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Update failed",
        description: "Failed to update your role preference",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Loading your account information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <>
              <div className="space-y-1">
                <Label>Email</Label>
                <div className="text-neutral-700 dark:text-neutral-300 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-md">
                  {user.primaryEmailAddress?.emailAddress}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label>Name</Label>
                <div className="text-neutral-700 dark:text-neutral-300 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-md">
                  {user.fullName || user.username || 'Not provided'}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label>Account Type</Label>
                <div className="text-neutral-700 dark:text-neutral-300 p-2 bg-neutral-50 dark:bg-neutral-900 rounded-md capitalize">
                  {userData?.plan || 'Free'} Plan
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
        </CardFooter>
      </Card>
      
      {/* Role Preference Card */}
      <Card>
        <CardHeader>
          <CardTitle>Role Preference</CardTitle>
          <CardDescription>
            Select your primary role to customize prompt enhancements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedRole}
            onValueChange={handleRoleChange}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
              <RadioGroupItem value="writer" id="writer" />
              <Label htmlFor="writer" className="cursor-pointer flex flex-col w-full">
                <span className="font-medium">Writer</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Content creators, copywriters, authors</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
              <RadioGroupItem value="designer" id="designer" />
              <Label htmlFor="designer" className="cursor-pointer flex flex-col w-full">
                <span className="font-medium">Designer</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">UI/UX designers, graphic artists</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
              <RadioGroupItem value="developer" id="developer" />
              <Label htmlFor="developer" className="cursor-pointer flex flex-col w-full">
                <span className="font-medium">Developer</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Software engineers, coders</span>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5">
              <RadioGroupItem value="marketer" id="marketer" />
              <Label htmlFor="marketer" className="cursor-pointer flex flex-col w-full">
                <span className="font-medium">Marketer</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Digital marketers, growth specialists</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      {/* Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg capitalize">{userData?.plan || 'Free'} Plan</h3>
              {userData?.plan === 'free' ? (
                <span className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300 rounded-full">
                  Current Plan
                </span>
              ) : (
                <span className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full">
                  Current Plan
                </span>
              )}
            </div>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              {userData?.plan === 'free' 
                ? 'Limited to 10 prompt enhancements per day with 7-day history.' 
                : 'Unlimited prompt enhancements with full history and analytics.'}
            </p>
            
            <Button 
              className={userData?.plan === 'free' ? 'gradient-bg text-white w-full' : 'w-full'}
              variant={userData?.plan === 'free' ? 'default' : 'outline'}
              disabled={userData?.plan === 'pro'}
            >
              {userData?.plan === 'free' ? 'Upgrade to Pro' : 'Manage Subscription'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
