export function Testimonials() {
  const testimonials = [
    {
      text: "PromptP has completely transformed my writing workflow. I'm getting better results from AI tools with a fraction of the effort. The enhanced prompts are like magic!",
      author: "Jessica Miller",
      role: "Content Creator",
      rating: 5,
      initials: "JM",
      bgColor: "bg-primary-200",
      textColor: "text-primary-700"
    },
    {
      text: "As a developer, precise prompts are essential. PromptP helps me create detailed technical requests that get exactly the code solutions I need. A must-have tool.",
      author: "Ryan Kim",
      role: "Senior Developer",
      rating: 5,
      initials: "RK",
      bgColor: "bg-secondary-200",
      textColor: "text-secondary-700"
    },
    {
      text: "Our marketing team's productivity has increased by 40% since we started using PromptP. The role-specific enhancements are incredibly valuable for our campaigns.",
      author: "Sarah Adams",
      role: "Marketing Director",
      rating: 4.5,
      initials: "SA",
      bgColor: "bg-primary-200",
      textColor: "text-primary-700"
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Creators from all disciplines are boosting their productivity with PromptP
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="text-primary-500 mr-2 flex">
                  {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                  {testimonial.rating % 1 > 0 && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id={`half-star-${index}`}>
                          <stop offset="50%" stopColor="currentColor" />
                          <stop offset="50%" stopColor="none" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={`url(#half-star-${index})`} stroke="currentColor" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">{testimonial.rating}</span>
              </div>
              
              <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${testimonial.bgColor} dark:bg-opacity-30 flex items-center justify-center mr-3`}>
                  <span className={`${testimonial.textColor} dark:text-opacity-70 font-medium`}>{testimonial.initials}</span>
                </div>
                <div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">{testimonial.author}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
