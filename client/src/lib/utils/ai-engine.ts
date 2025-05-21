// A simple AI prompt enhancement engine that doesn't rely on external APIs

// User roles for specialized enhancements
export type UserRole = "writer" | "developer" | "designer" | "marketer";

// Define the structured format for our enhanced prompts
export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  wordCount: {
    original: number;
    enhanced: number;
  };
  specificity: "low" | "medium" | "high";
}

// Common enhancement patterns by section
const enhancementTemplates = {
  context: [
    "Provide context about the project/situation where this will be used",
    "Include background information on the topic",
    "Specify the intended audience for this content",
    "Clarify the purpose of this request"
  ],
  structure: [
    "Break this down into numbered steps",
    "Organize this into sections with headings",
    "Use bullet points to list out key requirements",
    "Include both examples and counter-examples"
  ],
  details: [
    "Include specific metrics or measurements",
    "Add technical specifications",
    "Describe visual elements in detail",
    "Mention required formats and dimensions"
  ],
  style: [
    "Specify the desired tone (e.g., professional, casual, technical)",
    "Reference examples of preferred style",
    "Include any branding guidelines to follow",
    "Note any terminology preferences or restrictions"
  ],
  delivery: [
    "Set expectations for the length/scope of the response",
    "Include formatting requirements",
    "Specify any constraints or limitations",
    "Request specific file formats or deliverables"
  ]
};

// Role-specific enhancements
const roleSpecificEnhancements: Record<UserRole, string[]> = {
  writer: [
    "Include character development guidelines",
    "Specify narrative style (first-person, third-person, etc.)",
    "Define the pacing and structure of the content",
    "Request specific literary devices or techniques"
  ],
  developer: [
    "Specify programming language and environment",
    "Include performance requirements",
    "Define API specifications or interfaces",
    "Request code comments and documentation style"
  ],
  designer: [
    "Specify color schemes and visual styling",
    "Include brand guidelines to follow",
    "Define target devices and screen sizes",
    "Request specific file formats and resolutions"
  ],
  marketer: [
    "Define target audience demographics",
    "Specify call-to-action requirements",
    "Include brand voice guidelines",
    "Request SEO considerations and keywords"
  ]
};

// Topic detection for contextual enhancements
const topicKeywords: Record<string, string[]> = {
  technology: ["code", "app", "website", "software", "tech", "program", "develop", "algorithm"],
  business: ["brand", "market", "company", "startup", "product", "customer", "client", "strategy"],
  creative: ["design", "story", "write", "art", "create", "content", "visual", "brand"],
  education: ["learn", "teach", "course", "explain", "student", "concept", "understand"]
};

// Detect probable topics from the input
function detectTopics(input: string): string[] {
  const lowercaseInput = input.toLowerCase();
  return Object.keys(topicKeywords).filter(topic => 
    topicKeywords[topic].some(keyword => lowercaseInput.includes(keyword))
  );
}

// Calculate specificity level
function calculateSpecificity(text: string): "low" | "medium" | "high" {
  const wordCount = text.split(/\s+/).length;
  const hasSpecificTerms = /specific|exactly|precise|detailed/i.test(text);
  const hasMeasurements = /\d+\s*(px|em|rem|cm|mm|%|seconds|minutes)/i.test(text);
  
  if ((wordCount > 15 && hasSpecificTerms) || hasMeasurements) {
    return "high";
  } else if (wordCount > 8) {
    return "medium";
  }
  return "low";
}

// Count words in a text string
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// Generate an enhanced prompt
export function enhancePrompt(
  originalPrompt: string, 
  role: UserRole = "writer",
  shouldAddSections = true
): EnhancedPrompt {
  // Trim and ensure the prompt is not empty
  const trimmedPrompt = originalPrompt.trim();
  if (!trimmedPrompt) {
    return {
      original: "",
      enhanced: "Please provide a prompt to enhance.",
      wordCount: { original: 0, enhanced: 7 },
      specificity: "low"
    };
  }

  // Start with the original prompt
  let enhancedText = trimmedPrompt;
  
  // Detect topics for context-aware enhancement
  const detectedTopics = detectTopics(trimmedPrompt);
  
  // Determine which sections to include based on the original prompt
  const originalWords = countWords(trimmedPrompt);
  
  // For very short prompts, add more structure and context
  if (originalWords < 5) {
    // Add a more comprehensive structure for very basic prompts
    enhancedText = `Provide a detailed and comprehensive ${detectedTopics.length > 0 ? detectedTopics.join("/") + " " : ""}${enhancedText} that includes:\n\n`;
    
    // Add structured sections
    if (shouldAddSections) {
      const sections = [
        "1. Clear context and background information",
        "2. Specific details and requirements",
        "3. Desired format and structure",
        "4. Style and tone guidelines",
        "5. Examples or references if applicable"
      ];
      
      enhancedText += sections.join("\n");
    }
    
    // Add role-specific enhancements
    const roleEnhancements = roleSpecificEnhancements[role].slice(0, 2);
    if (roleEnhancements.length > 0) {
      enhancedText += "\n\nAlso include:\n" + roleEnhancements.map(e => `- ${e}`).join("\n");
    }
  } 
  // For medium length prompts, add structure while keeping the original intent
  else if (originalWords < 15) {
    // Create a more structured version of the original prompt
    enhancedText = `${enhancedText}\n\nPlease include:\n`;
    
    // Select relevant enhancement templates based on the role and detected topics
    const relevantEnhancements = [
      ...enhancementTemplates.context.slice(0, 1),
      ...enhancementTemplates.structure.slice(0, 1),
      ...enhancementTemplates.details.slice(0, 2),
      ...roleSpecificEnhancements[role].slice(0, 2)
    ];
    
    enhancedText += relevantEnhancements.map(e => `- ${e}`).join("\n");
  }
  // For longer prompts, refine and add specialized enhancements
  else {
    // The prompt already has some substance, add role-specific enhancements
    enhancedText += "\n\nAdditional requirements:\n";
    
    // Add 3-4 role-specific enhancements
    const topEnhancements = roleSpecificEnhancements[role].slice(0, 3);
    enhancedText += topEnhancements.map(e => `- ${e}`).join("\n");
    
    // Add a general quality guideline
    enhancedText += "\n\nEnsure the output is comprehensive, well-structured, and aligned with professional standards for this type of content.";
  }

  return {
    original: originalPrompt,
    enhanced: enhancedText,
    wordCount: {
      original: originalWords,
      enhanced: countWords(enhancedText)
    },
    specificity: calculateSpecificity(enhancedText)
  };
}
