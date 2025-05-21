import { UserRole, EnhancedPrompt, enhancePrompt as basicEnhance } from "./ai-engine";
import OpenAI from "openai";

// Check if OpenAI key is available for advanced features
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
const openai = hasOpenAIKey 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

// Template formats for different types of prompts
const promptTemplates: Record<string, string> = {
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
const roleTemplateEnhancements: Record<UserRole, Record<string, string>> = {
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

// Generate a prompt based on a template
export function generatePromptFromTemplate(
  templateKey: string, 
  topic: string,
  role: UserRole = "writer"
): string {
  // Get the base template
  const baseTemplate = promptTemplates[templateKey] || promptTemplates.blog;
  
  // Insert the topic
  let generatedPrompt = baseTemplate.replace(/\{topic\}/g, topic).replace(/\{purpose\}/g, topic);
  
  // Add role-specific enhancements if available
  const roleEnhancement = roleTemplateEnhancements[role]?.[templateKey];
  if (roleEnhancement) {
    generatedPrompt += `\n\nSince you're a ${role}, also ${roleEnhancement}`;
  }
  
  return generatedPrompt;
}

// Types of templates available
export type PromptTemplate = keyof typeof promptTemplates;

// Interface for prompt generation options
export interface PromptGenerationOptions {
  topic: string;
  templateType?: PromptTemplate;
  role?: UserRole;
  useAdvancedAI?: boolean;
}

// Interface for the response from generatePrompt
export interface GeneratedPromptResult {
  prompt: string;
  enhancedPrompt: EnhancedPrompt;
  isAdvanced: boolean;
}

// Main function to generate and enhance prompts
export async function generatePrompt(
  options: PromptGenerationOptions
): Promise<GeneratedPromptResult> {
  const { 
    topic, 
    templateType = "blog", 
    role = "writer", 
    useAdvancedAI = false 
  } = options;
  
  // Generate base prompt from template
  const basePrompt = generatePromptFromTemplate(
    templateType, 
    topic,
    role
  );
  
  // Use OpenAI if available and requested
  if (useAdvancedAI && hasOpenAIKey && openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system", 
            content: `You are an expert prompt engineer specialized in creating high-quality prompts for ${role}s. 
                     Generate an enhanced version of the prompt below, focusing on clarity, 
                     specificity, and comprehensive requirements.`
          },
          { 
            role: "user", 
            content: basePrompt 
          }
        ],
        max_tokens: 1000,
      });
      
      const enhancedText = completion.choices[0].message.content || basePrompt;
      
      // Format the enhanced prompt result
      return {
        prompt: basePrompt,
        enhancedPrompt: {
          original: basePrompt,
          enhanced: enhancedText,
          wordCount: {
            original: countWords(basePrompt),
            enhanced: countWords(enhancedText)
          },
          specificity: calculateSpecificity(enhancedText)
        },
        isAdvanced: true
      };
    } catch (error) {
      console.warn("Error using OpenAI for prompt enhancement, falling back to basic enhancement:", error);
      // Fall back to basic enhancement on error
    }
  }
  
  // Use basic enhancement if advanced is not available or fails
  const enhancedPrompt = basicEnhance(basePrompt, role);
  
  return {
    prompt: basePrompt,
    enhancedPrompt,
    isAdvanced: false
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