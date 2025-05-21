export function UseCases() {
  const useCases = [
    {
      role: "Writers",
      icon: "pen-tool",
      iconColor: "text-primary-500",
      description: "Craft detailed story premises, character descriptions, and plot outlines. Generate writing prompts that inspire creativity and overcome writer's block.",
      example: "\"Write a story about space\" → Detailed character-driven space exploration narrative with specific setting, conflict, and thematic elements.",
      svgContent: (
        <>
          <rect width="100%" height="100%" fill="#f8fafc" />
          <path d="M20,20 L260,20 L260,50 L20,50 Z" fill="#e2e8f0" />
          <path d="M50,70 L230,70 L230,85 L50,85 Z" fill="#cbd5e1" />
          <path d="M50,95 L180,95 L180,110 L50,110 Z" fill="#cbd5e1" />
          <path d="M20,130 L260,130 L260,160 L20,160 Z" fill="#e2e8f0" />
          <path d="M20,170 L260,170 L260,200 L20,200 Z" fill="#e2e8f0" />
        </>
      )
    },
    {
      role: "Designers",
      icon: "palette",
      iconColor: "text-secondary-500",
      description: "Create detailed visual prompts for illustrations, UI/UX designs, and graphic elements. Define style, mood, composition, and technical requirements.",
      example: "\"Design a logo for a coffee shop\" → Comprehensive brand identity design prompt with style references, color psychology, and application contexts.",
      svgContent: (
        <>
          <rect width="100%" height="100%" fill="#f8fafc" />
          <rect x="20" y="20" width="120" height="80" rx="4" fill="#e2e8f0" />
          <rect x="150" y="20" width="120" height="80" rx="4" fill="#e2e8f0" />
          <rect x="20" y="110" width="250" height="40" rx="4" fill="#e2e8f0" />
          <circle cx="40" cy="180" r="15" fill="#cbd5e1" />
          <circle cx="80" cy="180" r="15" fill="#94a3b8" />
          <circle cx="120" cy="180" r="15" fill="#64748b" />
        </>
      )
    },
    {
      role: "Developers",
      icon: "code",
      iconColor: "text-primary-500",
      description: "Generate detailed technical specifications, code solutions, and debugging strategies. Create well-structured prompts for explaining complex code concepts.",
      example: "\"Help with React hooks\" → Comprehensive explanation request with specific use cases, common pitfalls, and best practice implementation examples.",
      svgContent: (
        <>
          <rect width="100%" height="100%" fill="#0f172a" />
          <path d="M20,20 L260,20 L260,30 L20,30 Z" fill="#1e293b" />
          <path d="M20,40 L150,40 L150,45 L20,45 Z" fill="#334155" />
          <path d="M20,55 L200,55 L200,60 L20,60 Z" fill="#334155" />
          <path d="M20,70 L180,70 L180,75 L20,75 Z" fill="#334155" />
          <path d="M20,85 L220,85 L220,90 L20,90 Z" fill="#334155" />
          <path d="M20,100 L160,100 L160,105 L20,105 Z" fill="#334155" />
          <path d="M20,115 L240,115 L240,120 L20,120 Z" fill="#334155" />
          <path d="M20,130 L200,130 L200,135 L20,135 Z" fill="#334155" />
          <path d="M20,145 L180,145 L180,150 L20,150 Z" fill="#334155" />
          <path d="M20,160 L120,160 L120,165 L20,165 Z" fill="#334155" />
        </>
      )
    },
    {
      role: "Marketers",
      icon: "trending-up",
      iconColor: "text-secondary-500",
      description: "Draft compelling ad copy, social media content, and campaign strategies. Ensure messaging is aligned with brand voice and targeted to specific audiences.",
      example: "\"Write social media posts\" → Targeted multi-platform content strategy with platform-specific formatting, audience targeting, and engagement hooks.",
      svgContent: (
        <>
          <rect width="100%" height="100%" fill="#f8fafc" />
          <rect x="20" y="20" width="250" height="60" rx="4" fill="#e2e8f0" />
          <path d="M20,90 L150,90 L150,105 L20,105 Z" fill="#cbd5e1" />
          <rect x="20" y="115" width="250" height="1" fill="#e2e8f0" />
          <rect x="20" y="125" width="250" height="60" rx="4" fill="#e2e8f0" />
          <path d="M40,150 L80,130 L120,140 L160,120 L200,135 L240,115" stroke="#64748b" strokeWidth="2" fill="none" />
        </>
      )
    }
  ];

  return (
    <section id="use-cases" className="py-16 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Tailored for Every Creator</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            PromptP adapts to your specific needs based on your creative role
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="card-hover rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-md">
              <div className="h-48 bg-white dark:bg-neutral-900">
                <svg viewBox="0 0 300 200" className="w-full h-full">
                  {useCase.svgContent}
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${useCase.iconColor} mr-2`}>
                    {useCase.icon === "pen-tool" && (
                      <>
                        <path d="m12 19 7-7 3 3-7 7-3-3z"></path>
                        <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                        <path d="m2 2 7.586 7.586"></path>
                        <circle cx="11" cy="11" r="2"></circle>
                      </>
                    )}
                    {useCase.icon === "palette" && (
                      <>
                        <circle cx="13.5" cy="6.5" r="2.5"></circle>
                        <circle cx="17.5" cy="10.5" r="2.5"></circle>
                        <circle cx="8.5" cy="7.5" r="2.5"></circle>
                        <circle cx="6.5" cy="12.5" r="2.5"></circle>
                        <path d="M12 22v-5"></path>
                        <path d="M5 18v-3"></path>
                        <path d="M19 14v-3"></path>
                      </>
                    )}
                    {useCase.icon === "code" && (
                      <>
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                      </>
                    )}
                    {useCase.icon === "trending-up" && (
                      <>
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </>
                    )}
                  </svg>
                  For {useCase.role}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {useCase.description}
                </p>
                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg text-sm">
                  <p className="font-medium text-neutral-700 dark:text-neutral-300 mb-2">Example enhancement:</p>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {useCase.example}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
