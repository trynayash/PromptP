import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Demo() {
  return (
    <section id="demo" className="py-16 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">See PromptP in Action</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Watch how our AI transforms basic prompts into powerful, context-rich instructions
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Basic Prompt</h3>
                <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full">Before</span>
              </div>
              <div className="h-48 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 rounded-lg mb-4 p-4">
                <p className="text-neutral-600 dark:text-neutral-400">Write about climate change</p>
              </div>
              <div className="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
                <span>Word count: 4</span>
                <span>Specificity: Low</span>
              </div>
            </div>
            
            {/* After Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-primary-200 dark:border-primary-800/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-primary-600 dark:text-primary-400">Enhanced Prompt</h3>
                <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">After</span>
              </div>
              <div className="h-48 overflow-auto bg-gradient-to-br from-primary-50/50 to-secondary-50/50 dark:from-primary-900/10 dark:to-secondary-900/10 rounded-lg mb-4 p-4">
                <p className="text-neutral-700 dark:text-neutral-300">
                  Write a comprehensive analysis of climate change that includes:
                  <br /><br />
                  1. The key scientific evidence for global warming over the past century
                  <br />
                  2. Major environmental and societal impacts already being observed
                  <br />
                  3. Projected scenarios for the next 50 years based on current models
                  <br />
                  4. The most promising technological solutions currently being developed
                  <br />
                  5. Policy approaches that have shown success in reducing emissions
                  <br /><br />
                  Include specific data points and source references where relevant. Balance scientific accuracy with accessibility for a general audience.
                </p>
              </div>
              <div className="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-400">
                <span>Word count: 89</span>
                <span>Specificity: High</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/try-demo">
              <Button className="px-8 py-3 rounded-lg gradient-bg text-white shadow-md hover:shadow-xl transition-shadow">
                Try It Yourself
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
