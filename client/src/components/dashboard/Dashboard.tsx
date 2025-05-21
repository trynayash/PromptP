import { UsageStats } from "./UsageStats";
import { AccountSettings } from "./AccountSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-start mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Monitor your usage and manage your account
        </p>
      </div>
      
      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
          <TabsTrigger value="settings">Account Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usage" className="pt-6">
          <UsageStats />
        </TabsContent>
        
        <TabsContent value="settings" className="pt-6">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
