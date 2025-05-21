export function TrustedBy() {
  return (
    <section className="py-12 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-neutral-500 dark:text-neutral-400 mb-8">Trusted by creators from leading companies</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
          {/* Company logos */}
          <svg className="h-8 w-28" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="40" rx="4" fill="currentColor" fillOpacity="0.1" />
            <path d="M30 15H90V25H30V15Z" fill="currentColor" fillOpacity="0.3" />
          </svg>
          
          <svg className="h-8 w-28" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="40" rx="4" fill="currentColor" fillOpacity="0.1" />
            <circle cx="60" cy="20" r="10" fill="currentColor" fillOpacity="0.3" />
          </svg>
          
          <svg className="h-8 w-28" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="40" rx="4" fill="currentColor" fillOpacity="0.1" />
            <path d="M40 10L60 30L80 10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="4" />
          </svg>
          
          <svg className="h-8 w-28" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="120" height="40" rx="4" fill="currentColor" fillOpacity="0.1" />
            <rect x="35" y="15" width="50" height="10" rx="5" fill="currentColor" fillOpacity="0.3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
