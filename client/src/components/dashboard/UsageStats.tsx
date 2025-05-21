import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useAuth } from "@/hooks/use-auth";

interface UserStats {
  totalPrompts: number;
  lastWeekPrompts: number;
  roleBreakdown: Record<string, number>;
  plan: string;
  dailyLimit: number | null;
  promptsUsedToday: number;
}

export function UsageStats() {
  const { isSignedIn } = useAuth();
  
  const { data, isLoading, isError } = useQuery<UserStats>({
    queryKey: ['/api/stats/usage'],
    enabled: isSignedIn,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Stats</CardTitle>
          <CardDescription>We couldn't load your usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            There was an error retrieving your usage data. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format role breakdown data for pie chart
  const roleData = Object.entries(data.roleBreakdown || {}).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: count
  }));

  // Colors for the pie chart
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6">
      {/* Plan usage card for free tier */}
      {data.plan === "free" && data.dailyLimit && (
        <Card>
          <CardHeader>
            <CardTitle>Free Plan Usage</CardTitle>
            <CardDescription>
              {data.promptsUsedToday} of {data.dailyLimit} daily prompt enhancements used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(data.promptsUsedToday / data.dailyLimit) * 100} className="h-2" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
              {data.dailyLimit - data.promptsUsedToday} enhancements remaining today
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Upgrade to Pro for unlimited enhancements
            </p>
          </CardFooter>
        </Card>
      )}

      {/* Pro plan indicator */}
      {data.plan === "pro" && (
        <Card>
          <CardHeader>
            <CardTitle>Pro Plan</CardTitle>
            <CardDescription>
              Unlimited prompt enhancements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
            </div>
            <p className="text-center text-neutral-700 dark:text-neutral-300 font-medium">
              You have unlimited access to all premium features
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total usage card */}
        <Card>
          <CardHeader>
            <CardTitle>Total Usage</CardTitle>
            <CardDescription>
              Your prompt enhancement statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Total prompts enhanced</span>
                  <span className="font-semibold">{data.totalPrompts}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-neutral-600 dark:text-neutral-400">Last 7 days</span>
                  <span className="font-semibold">{data.lastWeekPrompts}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Role breakdown chart */}
        <Card>
          <CardHeader>
            <CardTitle>Role Breakdown</CardTitle>
            <CardDescription>
              Distribution of prompts by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roleData.length > 0 ? (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} prompts`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-neutral-500 dark:text-neutral-400">
                  No role data available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
