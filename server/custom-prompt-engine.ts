import { UserRole, EnhancedPrompt, enhancePrompt as basicEnhance } from "./ai-engine";

// Define prompt template types
export type PromptTemplateType = 
  | "blog" 
  | "technical" 
  | "creative" 
  | "marketing" 
  | "email" 
  | "social" 
  | "presentation" 
  | "product";

// Template formats for different types of prompts
const promptTemplates: Record<PromptTemplateType, string> = {
  blog: `Create a well-structured blog post outline about {topic}. Include an engaging introduction, at least 3-5 main sections with supporting points, and a compelling conclusion.`,
  
  technical: `Create a technical documentation template for {topic} that includes purpose, architecture overview, installation instructions, API documentation, troubleshooting section, and usage examples.`,
  
  creative: `Generate a creative writing prompt about {topic} that includes character details, setting description, plot elements, and thematic considerations.`,
  
  marketing: `Create a marketing campaign concept for {topic} that includes target audience, key messaging, channels/platforms, call-to-action, and metrics for measuring success.`,
  
  email: `Write an email template for {purpose} regarding {topic}. Include a compelling subject line, personalized greeting, clear and concise body that addresses the recipient's needs, and appropriate call-to-action.`,
  
  social: `Create social media content ideas for {topic} across multiple platforms (Instagram, Twitter, LinkedIn, TikTok). Include post types, hashtag strategies, and engagement prompts.`,
  
  presentation: `Design a presentation outline for {topic} with an attention-grabbing intro, key points organized in logical sections, visual element suggestions, and a memorable conclusion.`,
  
  product: `Develop a product description for {topic} that highlights unique selling points, technical specifications, benefits, use cases, and differentiators from competitors.`
};

// User role specific template augmentations
const roleTemplateEnhancements: Record<UserRole, Partial<Record<PromptTemplateType, string>>> = {
  writer: {
    blog: "Focus on narrative flow, engaging storytelling techniques, and a consistent voice.",
    technical: "Emphasize clarity, accuracy, and comprehensive explanations with minimal jargon.",
    creative: "Explore literary devices, character development, and emotional resonance.",
    email: "Craft conversational yet professional tone with precise language and emotional intelligence."
  },
  developer: {
    blog: "Include code snippets, technical specifications, and implementation considerations.",
    technical: "Add API reference documentation, system requirements, and performance optimization tips.",
    product: "Detail technical stack, integration capabilities, and developer-focused features.",
    presentation: "Structure content with technical depth while maintaining accessibility for mixed audiences."
  },
  designer: {
    blog: "Consider visual hierarchy, typography recommendations, and image placement.",
    creative: "Address visual elements, spatial relationships, and aesthetic considerations.",
    social: "Focus on visual consistency, brand identity, and design trends appropriate for each platform.",
    presentation: "Emphasize visual storytelling elements, slide design principles, and visual communication best practices."
  },
  marketer: {
    blog: "Incorporate SEO considerations, conversion opportunities, and audience engagement strategies.",
    email: "Optimize for open rates, click-through rates, and conversion metrics.",
    social: "Align with campaign objectives, target audience insights, and performance metrics.",
    product: "Highlight marketable features, competitive advantages, and compelling value propositions."
  }
};

// Additional industry-specific enhancement templates
const industryEnhancements: Record<string, string> = {
  technology: "Include technical specifications, compatibility details, and integration capabilities.",
  healthcare: "Address compliance requirements, patient benefits, and clinical considerations.",
  education: "Focus on learning outcomes, engagement strategies, and assessment methods.",
  finance: "Include risk considerations, compliance requirements, and financial implications.",
  ecommerce: "Emphasize conversion elements, customer journey touchpoints, and purchase incentives.",
  entertainment: "Focus on audience engagement, emotional impact, and immersive experiences.",
  nonprofit: "Highlight mission alignment, impact metrics, and donor/volunteer engagement strategies."
};

// Advanced language patterns for different tones
const toneEnhancements: Record<string, string[]> = {
  professional: [
    "Maintain a consistent formal tone throughout the content.",
    "Use industry-standard terminology and avoid colloquialisms.",
    "Structure information in a logical, hierarchical manner.",
    "Emphasize data-driven insights and verifiable claims."
  ],
  conversational: [
    "Use a friendly, approachable tone that feels like a conversation.",
    "Incorporate occasional questions to engage the reader.",
    "Balance informal language with clear, valuable information.",
    "Use shorter sentences and simpler vocabulary while maintaining sophistication."
  ],
  persuasive: [
    "Use compelling evidence and social proof to support key points.",
    "Address potential objections proactively.",
    "Incorporate persuasive language patterns and rhetorical devices.",
    "Create a clear, logical progression toward the desired action."
  ],
  instructional: [
    "Use clear, step-by-step directions with numbered sequences.",
    "Anticipate common questions and provide preemptive answers.",
    "Use visual language to create clear mental models.",
    "Include specific examples for abstract concepts."
  ],
  inspirational: [
    "Use emotionally resonant language that evokes positive feelings.",
    "Incorporate storytelling elements to illustrate key points.",
    "Balance aspiration with actionable, practical guidance.",
    "Use sensory language to create vivid mental imagery."
  ]
};

// Topic expansion library - used to suggest related topics
const topicExpansions: Record<string, string[]> = {
  marketing: [
    "content marketing", "email campaigns", "social media strategy", 
    "brand positioning", "customer acquisition", "retention strategies"
  ],
  technology: [
    "software development", "cloud infrastructure", "data analytics", 
    "cybersecurity", "artificial intelligence", "user experience"
  ],
  business: [
    "strategic planning", "operational efficiency", "team management", 
    "financial forecasting", "business model innovation", "market research"
  ],
  design: [
    "user interface", "visual communication", "brand identity", 
    "information architecture", "accessibility", "responsive design"
  ],
  writing: [
    "content creation", "storytelling", "editorial planning", 
    "SEO optimization", "grammar and style", "audience engagement"
  ],
  productivity: [
    "time management", "workflow optimization", "goal setting", 
    "task prioritization", "focus techniques", "habit formation"
  ]
};

// Generate a prompt based on a template
export function generatePromptFromTemplate(
  templateType: PromptTemplateType, 
  topic: string,
  role: UserRole = "writer",
  tone: string = "professional",
  industry?: string
): string {
  // Get the base template
  const baseTemplate = promptTemplates[templateType] || promptTemplates.blog;
  
  // Insert the topic
  let generatedPrompt = baseTemplate.replace(/\{topic\}/g, topic).replace(/\{purpose\}/g, topic);
  
  // Add tone-specific enhancements
  const selectedTone = toneEnhancements[tone] || toneEnhancements.professional;
  generatedPrompt += "\n\nTone and Style Guidelines:\n" + selectedTone.map(t => `- ${t}`).join("\n");
  
  // Add role-specific enhancements if available
  const roleEnhancement = roleTemplateEnhancements[role]?.[templateType];
  if (roleEnhancement) {
    generatedPrompt += `\n\nRole-Specific Requirements (${role}):\n- ${roleEnhancement}`;
  }
  
  // Add industry-specific guidance if provided
  if (industry && industryEnhancements[industry]) {
    generatedPrompt += `\n\nIndustry Considerations (${industry}):\n- ${industryEnhancements[industry]}`;
  }
  
  // Add related topics for consideration
  let relatedTopicCategory = Object.keys(topicExpansions).find(key => 
    topic.toLowerCase().includes(key) || templateType.includes(key)
  );
  
  if (relatedTopicCategory && topicExpansions[relatedTopicCategory]) {
    const relatedTopics = topicExpansions[relatedTopicCategory].slice(0, 3);
    generatedPrompt += "\n\nConsider including these related aspects:\n" + 
      relatedTopics.map(t => `- ${t}`).join("\n");
  }
  
  // Add quality control guidance
  generatedPrompt += "\n\nQuality Control:\n" +
    "- Ensure all content is accurate, clear, and well-structured\n" +
    "- Verify that the content meets the specific requirements of the request\n" +
    "- Check that the tone is consistent throughout\n" +
    "- Review for completeness and comprehensiveness";
  
  return generatedPrompt;
}

// Interface for prompt generation options
export interface PromptGenerationOptions {
  topic: string;
  templateType?: PromptTemplateType;
  role?: UserRole;
  tone?: string;
  industry?: string;
  useEnhancedAlgorithm?: boolean;
}

// Interface for the response from generatePrompt
export interface GeneratedPromptResult {
  prompt: string;
  enhancedPrompt: EnhancedPrompt;
  isEnhanced: boolean;
  additionalSuggestions?: string[];
}

// Advanced prompt enhancement system (simulation of more sophisticated algorithm)
function enhancedEnhancement(prompt: string, role: UserRole): EnhancedPrompt {
  // First apply basic enhancement
  const baseEnhancement = basicEnhance(prompt, role);
  
  // Then add additional sophistication (in a real system, this could be much more advanced)
  let enhancedText = baseEnhancement.enhanced;
  
  // For demonstration, let's add some advanced structure
  enhancedText += "\n\nAdvanced Optimization Guidelines:\n";
  
  // Add role-specific advanced techniques
  switch (role) {
    case "writer":
      enhancedText += "- Implement narrative structures that create emotional resonance\n";
      enhancedText += "- Use sensory language to create immersive experiences\n";
      enhancedText += "- Apply rhetorical techniques like anaphora or chiasmus for emphasis\n";
      break;
    case "developer":
      enhancedText += "- Include efficiency considerations and computational complexity\n";
      enhancedText += "- Address edge cases and error handling scenarios\n";
      enhancedText += "- Add maintenance and scalability considerations\n";
      break;
    case "designer":
      enhancedText += "- Consider accessibility requirements (WCAG guidelines)\n";
      enhancedText += "- Include responsive design considerations for different devices\n";
      enhancedText += "- Address visual hierarchy and information architecture\n";
      break;
    case "marketer":
      enhancedText += "- Incorporate psychological triggers and persuasion principles\n";
      enhancedText += "- Add customer journey mapping and touchpoint optimization\n";
      enhancedText += "- Include competitor differentiation strategies\n";
      break;
  }
  
  // Add universal quality improvements
  enhancedText += "\nQuality Enhancement Requirements:\n";
  enhancedText += "- Optimize for clarity, precision, and impact\n";
  enhancedText += "- Ensure comprehensive coverage of all relevant aspects\n";
  enhancedText += "- Incorporate evidence-based best practices\n";
  
  return {
    original: prompt,
    enhanced: enhancedText,
    wordCount: {
      original: countWords(prompt),
      enhanced: countWords(enhancedText)
    },
    specificity: calculateSpecificity(enhancedText)
  };
}

// Generate related topic suggestions
function generateRelatedTopicSuggestions(topic: string, templateType: PromptTemplateType): string[] {
  // Find the most relevant category for the topic
  const relevantCategory = Object.keys(topicExpansions).find(key => 
    topic.toLowerCase().includes(key) || templateType.includes(key)
  ) || Object.keys(topicExpansions)[Math.floor(Math.random() * Object.keys(topicExpansions).length)];
  
  // Get related topics from that category
  const relatedTopics = topicExpansions[relevantCategory] || [];
  
  // Return 3 random topics from the category
  return relatedTopics
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map(t => `${topic} with focus on ${t}`);
}

// Main function to generate and enhance prompts
export function generatePrompt(
  options: PromptGenerationOptions
): GeneratedPromptResult {
  const { 
    topic, 
    templateType = "blog" as PromptTemplateType, 
    role = "writer", 
    tone = "professional",
    industry,
    useEnhancedAlgorithm = false 
  } = options;
  
  // Generate base prompt from template
  const basePrompt = generatePromptFromTemplate(
    templateType, 
    topic,
    role,
    tone,
    industry
  );
  
  // Use enhanced algorithm if requested
  const enhancedPrompt = useEnhancedAlgorithm
    ? enhancedEnhancement(basePrompt, role)
    : basicEnhance(basePrompt, role);
  
  // Generate related topic suggestions
  const additionalSuggestions = generateRelatedTopicSuggestions(topic, templateType);
  
  return {
    prompt: basePrompt,
    enhancedPrompt,
    isEnhanced: useEnhancedAlgorithm,
    additionalSuggestions
  };
}

// Helper function to count words
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// Helper function to calculate specificity
function calculateSpecificity(text: string): "low" | "medium" | "high" {
  const wordCount = countWords(text);
  const hasSpecificTerms = /specific|exactly|precise|detailed/i.test(text);
  const hasMeasurements = /\d+\s*(px|em|rem|cm|mm|%|seconds|minutes)/i.test(text);
  
  if ((wordCount > 15 && hasSpecificTerms) || hasMeasurements) {
    return "high";
  } else if (wordCount > 8) {
    return "medium";
  }
  return "low";
}