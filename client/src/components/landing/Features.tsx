export function Features() {
  const features = [
    {
      icon: "brain",
      title: "Smart Enhancement",
      description: "Our AI analyzes your basic prompts and automatically enhances them with structure, context, and specificity."
    },
    {
      icon: "history",
      title: "Prompt History",
      description: "Access, reuse, and improve your past prompts with a complete history and organization system."
    },
    {
      icon: "share-2",
      title: "Quick Sharing",
      description: "Share your enhanced prompts directly with teammates or export them to your favorite AI tools."
    },
    {
      icon: "user",
      title: "Role-Based Prompts",
      description: "Tailored prompt enhancements based on your role as a writer, marketer, developer, or designer."
    },
    {
      icon: "bar-chart-2",
      title: "Usage Analytics",
      description: "Track your prompt enhancement patterns and discover opportunities to improve your AI interactions."
    },
    {
      icon: "zap",
      title: "Blazing Fast",
      description: "Get instant prompt enhancements without waiting, powered by our efficient AI engine."
    }
  ];

  return (
    <section id="features" className="py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Unlock Your Creative Potential</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            PromptP enhances your workflow with powerful AI-driven features
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card-hover rounded-xl p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  {feature.icon === "brain" && (
                    <>
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"></path>
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"></path>
                    </>
                  )}
                  {feature.icon === "history" && (
                    <>
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                      <path d="M12 7v5l4 2"></path>
                    </>
                  )}
                  {feature.icon === "share-2" && (
                    <>
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </>
                  )}
                  {feature.icon === "user" && (
                    <>
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </>
                  )}
                  {feature.icon === "bar-chart-2" && (
                    <>
                      <line x1="18" y1="20" x2="18" y2="10"></line>
                      <line x1="12" y1="20" x2="12" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="14"></line>
                    </>
                  )}
                  {feature.icon === "zap" && (
                    <>
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </>
                  )}
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
