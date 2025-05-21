import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-24">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_60%)]"></div>
        <div className="absolute bottom-0 left-0 right-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.15),transparent_60%)]"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
              Turn Basic Ideas into <span className="gradient-text">Brilliant AI Prompts</span>
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
              PromptP enhances your simple prompts into powerful, structured, and context-optimized instructions that get the best results from any AI tool.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="px-8 py-6 rounded-lg gradient-bg text-white shadow-md hover:shadow-xl transition-shadow">
                Start Prompting Smarter
              </Button>
              <Button variant="outline" className="px-8 py-6 rounded-lg">
                See Demo
              </Button>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative">
            <div className="rounded-xl shadow-xl w-full h-auto animate-float overflow-hidden">
              <svg className="w-full" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="600" rx="8" fill="url(#heroGradient)" />
                
                {/* Creative workspace elements */}
                <rect x="50" y="50" width="700" height="500" rx="4" fill="#ffffff" fillOpacity="0.9" />
                <rect x="80" y="80" width="400" height="30" rx="4" fill="#f1f5f9" />
                <rect x="80" y="130" width="640" height="100" rx="4" fill="#f1f5f9" />
                <rect x="80" y="250" width="640" height="2" rx="1" fill="#e2e8f0" />
                <rect x="80" y="270" width="640" height="240" rx="4" fill="#f1f5f9" />
                
                {/* Input/output prompt visualization */}
                <rect x="100" y="150" width="280" height="60" rx="4" fill="#ffffff" stroke="#e2e8f0" />
                <rect x="420" y="150" width="280" height="60" rx="4" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                
                <rect x="100" y="300" width="280" height="190" rx="4" fill="#ffffff" stroke="#e2e8f0" />
                <rect x="420" y="300" width="280" height="190" rx="4" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" />
                
                {/* Text placeholders */}
                <rect x="110" y="160" width="180" height="6" rx="3" fill="#cbd5e1" />
                <rect x="110" y="176" width="140" height="6" rx="3" fill="#cbd5e1" />
                
                <rect x="430" y="160" width="240" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                <rect x="430" y="176" width="200" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                <rect x="430" y="192" width="180" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                
                {/* Before/After labels */}
                <rect x="110" y="315" width="40" height="14" rx="7" fill="#e2e8f0" />
                <rect x="430" y="315" width="40" height="14" rx="7" fill="#7c3aed" fillOpacity="0.2" />
                
                {/* Simple prompt placeholder */}
                <rect x="110" y="340" width="220" height="6" rx="3" fill="#cbd5e1" />
                
                {/* Enhanced prompt placeholder */}
                <rect x="430" y="340" width="240" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                <rect x="430" y="356" width="240" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                <rect x="430" y="372" width="200" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                <rect x="430" y="388" width="220" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                <rect x="430" y="404" width="180" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                <rect x="430" y="420" width="240" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                <rect x="430" y="436" width="220" height="6" rx="3" fill="#7c3aed" fillOpacity="0.2" />
                
                <defs>
                  <linearGradient id="heroGradient" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-4 max-w-xs animate-float border border-neutral-200 dark:border-neutral-700" style={{animationDelay: '1s'}}>
              <div className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span>PromptP-Enhanced</span>
              </div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Generate a detailed 3D model of a futuristic sustainable city with lush vertical gardens, renewable energy sources, and efficient transportation systems.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
