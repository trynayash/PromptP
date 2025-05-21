import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { enhancePrompt } from "./ai-engine";
import { generatePrompt, PromptTemplateType } from "./custom-prompt-engine";
import { analyzePromptQuality } from "./prompt-quality-analyzer";
import {
  createDefaultPromptStructure,
  extractBlocksFromPrompt,
  updateBlock,
  addBlock, 
  removeBlock,
  reorderBlocks,
  getBlockTemplates,
  PromptBlockType
} from "./prompt-block-builder";
import {
  createTemplate,
  applyTemplate,
  validateTemplate,
  createTemplateVersion,
  searchTemplates,
  groupTemplatesByCategory,
  getPopularTemplates,
  getRecentTemplates,
  getRecommendedTemplates,
  compareTemplateVersions,
  PromptTemplate
} from "./template-manager";
import {
  generateRolePromptHeatmap,
  generateUsageTrends,
  generateUsageBreakdown,
  generateWordCountStats,
  generateUserInsights,
  trackUsage,
  DateRange,
  UsageDataPoint
} from "./analytics-engine";
import { z } from "zod";
import { insertPromptSchema } from "@shared/schema";

// Daily prompt limit for free users
const FREE_TIER_DAILY_LIMIT = 10;

export async function registerRoutes(app: Express): Promise<Server> {
  // Prompt Block Builder APIs
  app.post("/api/prompts/extract-blocks", async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1, "Prompt is required")
      });
      
      const { prompt } = schema.parse(req.body);
      
      // Extract blocks from the prompt
      const blocks = extractBlocksFromPrompt(prompt);
      
      return res.json({
        blocks,
        combinedPrompt: prompt,
        success: true
      });
    } catch (error: any) {
      console.error("Error extracting prompt blocks:", error);
      return res.status(400).json({ 
        message: "Failed to extract prompt blocks", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/prompts/block-templates", async (_req, res) => {
    try {
      // Get block templates
      const templates = getBlockTemplates();
      
      return res.json({
        templates,
        success: true
      });
    } catch (error: any) {
      console.error("Error getting block templates:", error);
      return res.status(500).json({ 
        message: "Failed to get block templates", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.post("/api/prompts/create-structure", async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().optional()
      });
      
      const { prompt } = schema.parse(req.body);
      
      // Create a structure from an existing prompt or create a default one
      const promptStructure = prompt 
        ? { blocks: extractBlocksFromPrompt(prompt), combinedPrompt: prompt }
        : createDefaultPromptStructure();
      
      return res.json({
        ...promptStructure,
        success: true
      });
    } catch (error: any) {
      console.error("Error creating prompt structure:", error);
      return res.status(400).json({ 
        message: "Failed to create prompt structure", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.post("/api/prompts/update-block", async (req, res) => {
    try {
      const schema = z.object({
        promptStructure: z.object({
          blocks: z.array(z.any()),
          combinedPrompt: z.string()
        }),
        blockId: z.string(),
        content: z.string()
      });
      
      const { promptStructure, blockId, content } = schema.parse(req.body);
      
      // Update the block
      const updatedStructure = updateBlock(promptStructure, blockId, content);
      
      return res.json({
        ...updatedStructure,
        success: true
      });
    } catch (error: any) {
      console.error("Error updating prompt block:", error);
      return res.status(400).json({ 
        message: "Failed to update prompt block", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.post("/api/prompts/add-block", async (req, res) => {
    try {
      const schema = z.object({
        promptStructure: z.object({
          blocks: z.array(z.any()),
          combinedPrompt: z.string()
        }),
        blockType: z.string().refine(type => 
          ['context', 'goal', 'tone', 'audience', 'constraints', 'format', 'examples', 'custom'].includes(type),
          { message: "Invalid block type" }
        )
      });
      
      const { promptStructure, blockType } = schema.parse(req.body);
      
      // Add a new block
      const updatedStructure = addBlock(promptStructure, blockType as PromptBlockType);
      
      return res.json({
        ...updatedStructure,
        success: true
      });
    } catch (error: any) {
      console.error("Error adding prompt block:", error);
      return res.status(400).json({ 
        message: "Failed to add prompt block", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.post("/api/prompts/remove-block", async (req, res) => {
    try {
      const schema = z.object({
        promptStructure: z.object({
          blocks: z.array(z.any()),
          combinedPrompt: z.string()
        }),
        blockId: z.string()
      });
      
      const { promptStructure, blockId } = schema.parse(req.body);
      
      // Remove a block
      const updatedStructure = removeBlock(promptStructure, blockId);
      
      return res.json({
        ...updatedStructure,
        success: true
      });
    } catch (error: any) {
      console.error("Error removing prompt block:", error);
      return res.status(400).json({ 
        message: "Failed to remove prompt block", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.post("/api/prompts/reorder-block", async (req, res) => {
    try {
      const schema = z.object({
        promptStructure: z.object({
          blocks: z.array(z.any()),
          combinedPrompt: z.string()
        }),
        blockId: z.string(),
        newOrder: z.number().int().min(0)
      });
      
      const { promptStructure, blockId, newOrder } = schema.parse(req.body);
      
      // Reorder blocks
      const updatedStructure = reorderBlocks(promptStructure, blockId, newOrder);
      
      return res.json({
        ...updatedStructure,
        success: true
      });
    } catch (error: any) {
      console.error("Error reordering prompt blocks:", error);
      return res.status(400).json({ 
        message: "Failed to reorder prompt blocks", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  // Template Management APIs
  // In-memory storage for templates
  const templates: PromptTemplate[] = [];
  
  app.post("/api/templates/create", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1, "Template name is required"),
        description: z.string(),
        userId: z.number(),
        role: z.enum(["writer", "designer", "developer", "marketer"]),
        category: z.string(),
        tags: z.array(z.string()),
        content: z.string().min(1, "Template content is required"),
        isPublic: z.boolean().default(false)
      });
      
      const templateInput = schema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUser(templateInput.userId);
      if (!user) {
        return res.status(404).json({ 
          message: "User not found", 
          success: false 
        });
      }
      
      // Create new template
      const template = createTemplate(templateInput);
      
      // Add to storage
      templates.push(template);
      
      return res.status(201).json({
        template,
        success: true
      });
    } catch (error: any) {
      console.error("Error creating template:", error);
      return res.status(400).json({ 
        message: "Failed to create template", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/templates", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const category = req.query.category as string | undefined;
      const searchQuery = req.query.search as string | undefined;
      const grouped = req.query.grouped === 'true';
      
      let filteredTemplates = [...templates];
      
      // Filter by user ID (if provided)
      if (userId) {
        // If user ID is provided, return user's templates + public templates
        filteredTemplates = filteredTemplates.filter(t => 
          t.userId === userId || t.isPublic
        );
      } else {
        // If no user ID, return only public templates
        filteredTemplates = filteredTemplates.filter(t => t.isPublic);
      }
      
      // Filter by category (if provided)
      if (category) {
        filteredTemplates = filteredTemplates.filter(t => t.category === category);
      }
      
      // Search if query provided
      if (searchQuery) {
        filteredTemplates = searchTemplates(filteredTemplates, searchQuery);
      }
      
      // Group by category if requested
      if (grouped) {
        const groupedTemplates = groupTemplatesByCategory(filteredTemplates);
        return res.json({
          templates: groupedTemplates,
          success: true
        });
      }
      
      return res.json({
        templates: filteredTemplates,
        success: true
      });
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      return res.status(500).json({ 
        message: "Failed to fetch templates", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const templateId = req.params.id;
      
      // Find template
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        return res.status(404).json({ 
          message: "Template not found", 
          success: false 
        });
      }
      
      return res.json({
        template,
        success: true
      });
    } catch (error: any) {
      console.error("Error fetching template:", error);
      return res.status(500).json({ 
        message: "Failed to fetch template", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.post("/api/templates/:id/apply", async (req, res) => {
    try {
      const templateId = req.params.id;
      
      const schema = z.object({
        variableValues: z.array(z.object({
          id: z.string(),
          value: z.string()
        }))
      });
      
      const { variableValues } = schema.parse(req.body);
      
      // Find template
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        return res.status(404).json({ 
          message: "Template not found", 
          success: false 
        });
      }
      
      // Apply template
      const appliedPrompt = applyTemplate(template, variableValues);
      
      // Increment usage count
      template.usageCount += 1;
      
      return res.json({
        prompt: appliedPrompt,
        success: true
      });
    } catch (error: any) {
      console.error("Error applying template:", error);
      return res.status(400).json({ 
        message: "Failed to apply template", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.post("/api/templates/:id/version", async (req, res) => {
    try {
      const templateId = req.params.id;
      
      const schema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        role: z.enum(["writer", "designer", "developer", "marketer"]).optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        content: z.string().optional(),
        isPublic: z.boolean().optional()
      });
      
      const updates = schema.parse(req.body);
      
      // Find template
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        return res.status(404).json({ 
          message: "Template not found", 
          success: false 
        });
      }
      
      // Create new version
      const newVersion = createTemplateVersion(template, updates);
      
      // Add to storage
      templates.push(newVersion);
      
      return res.status(201).json({
        template: newVersion,
        success: true
      });
    } catch (error: any) {
      console.error("Error creating template version:", error);
      return res.status(400).json({ 
        message: "Failed to create template version", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/templates/:id/versions", async (req, res) => {
    try {
      const templateId = req.params.id;
      
      // Find all versions of template
      const allVersions = [];
      
      // Start with the requested template
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        return res.status(404).json({ 
          message: "Template not found", 
          success: false 
        });
      }
      
      allVersions.push(template);
      
      // Find previous versions
      let previousId = template.previousVersionId;
      while (previousId) {
        const prevVersion = templates.find(t => t.id === previousId);
        if (prevVersion) {
          allVersions.push(prevVersion);
          previousId = prevVersion.previousVersionId;
        } else {
          break;
        }
      }
      
      // Find newer versions
      const newerVersions = templates.filter(t => t.previousVersionId === templateId);
      allVersions.push(...newerVersions);
      
      // Sort by version number
      allVersions.sort((a, b) => b.version - a.version);
      
      return res.json({
        versions: allVersions,
        success: true
      });
    } catch (error: any) {
      console.error("Error fetching template versions:", error);
      return res.status(500).json({ 
        message: "Failed to fetch template versions", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.post("/api/templates/compare", async (req, res) => {
    try {
      const schema = z.object({
        templateId1: z.string(),
        templateId2: z.string()
      });
      
      const { templateId1, templateId2 } = schema.parse(req.body);
      
      // Find templates
      const template1 = templates.find(t => t.id === templateId1);
      const template2 = templates.find(t => t.id === templateId2);
      
      if (!template1 || !template2) {
        return res.status(404).json({ 
          message: "One or both templates not found", 
          success: false 
        });
      }
      
      // Compare templates
      const comparison = compareTemplateVersions(template1, template2);
      
      return res.json({
        comparison,
        success: true
      });
    } catch (error: any) {
      console.error("Error comparing templates:", error);
      return res.status(400).json({ 
        message: "Failed to compare templates", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/templates/popular", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Get popular templates
      const popularTemplates = getPopularTemplates(templates, limit);
      
      return res.json({
        templates: popularTemplates,
        success: true
      });
    } catch (error: any) {
      console.error("Error fetching popular templates:", error);
      return res.status(500).json({ 
        message: "Failed to fetch popular templates", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/templates/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      // Get recent templates
      const recentTemplates = getRecentTemplates(templates, limit);
      
      return res.json({
        templates: recentTemplates,
        success: true
      });
    } catch (error: any) {
      console.error("Error fetching recent templates:", error);
      return res.status(500).json({ 
        message: "Failed to fetch recent templates", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/templates/recommended", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const role = req.query.role as UserRole | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (!userId || !role) {
        return res.status(400).json({ 
          message: "User ID and role are required", 
          success: false 
        });
      }
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          message: "User not found", 
          success: false 
        });
      }
      
      // Get user's used template IDs (fake data for demo)
      const userUsedTemplateIds: string[] = [];
      
      // Get recommended templates
      const recommendedTemplates = getRecommendedTemplates(
        templates, 
        role, 
        userUsedTemplateIds,
        limit
      );
      
      return res.json({
        templates: recommendedTemplates,
        success: true
      });
    } catch (error: any) {
      console.error("Error fetching recommended templates:", error);
      return res.status(500).json({ 
        message: "Failed to fetch recommended templates", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  // Analytics APIs
  // In-memory storage for usage data
  const usageData: UsageDataPoint[] = [];
  
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.number(),
        promptId: z.number().optional(),
        templateId: z.string().optional(),
        role: z.enum(["writer", "designer", "developer", "marketer"]),
        promptType: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        enhancementScore: z.number().optional(),
        wordCountBefore: z.number().optional(),
        wordCountAfter: z.number().optional(),
        sessionDuration: z.number().optional()
      });
      
      const pointData = schema.parse(req.body);
      
      // Track usage
      const dataPoint: UsageDataPoint = {
        ...pointData,
        timestamp: new Date()
      };
      
      // Add to storage
      trackUsage(usageData, dataPoint);
      
      return res.json({
        success: true
      });
    } catch (error: any) {
      console.error("Error tracking usage:", error);
      return res.status(400).json({ 
        message: "Failed to track usage", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/analytics/heatmap", async (req, res) => {
    try {
      const range = (req.query.range || 'last30days') as DateRange;
      
      // Generate heatmap data
      const heatmapData = generateRolePromptHeatmap(usageData, range);
      
      return res.json({
        heatmap: heatmapData,
        success: true
      });
    } catch (error: any) {
      console.error("Error generating heatmap:", error);
      return res.status(500).json({ 
        message: "Failed to generate heatmap", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/analytics/trends", async (req, res) => {
    try {
      const range = (req.query.range || 'last30days') as DateRange;
      const groupBy = (req.query.groupBy || 'day') as 'day' | 'week' | 'month';
      
      // Generate usage trends
      const trendsData = generateUsageTrends(usageData, range, groupBy);
      
      return res.json({
        trends: trendsData,
        success: true
      });
    } catch (error: any) {
      console.error("Error generating trends:", error);
      return res.status(500).json({ 
        message: "Failed to generate trends", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/analytics/breakdown", async (req, res) => {
    try {
      const range = (req.query.range || 'last30days') as DateRange;
      const breakdownBy = (req.query.breakdownBy || 'role') as 'role' | 'promptType' | 'category' | 'tags';
      
      // Generate usage breakdown
      const breakdownData = generateUsageBreakdown(usageData, breakdownBy, range);
      
      return res.json({
        breakdown: breakdownData,
        success: true
      });
    } catch (error: any) {
      console.error("Error generating breakdown:", error);
      return res.status(500).json({ 
        message: "Failed to generate breakdown", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/analytics/wordstats", async (req, res) => {
    try {
      const range = (req.query.range || 'last30days') as DateRange;
      
      // Generate word count stats
      const statsData = generateWordCountStats(usageData, range);
      
      return res.json({
        stats: statsData,
        success: true
      });
    } catch (error: any) {
      console.error("Error generating word stats:", error);
      return res.status(500).json({ 
        message: "Failed to generate word stats", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  app.get("/api/analytics/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const range = (req.query.range || 'last30days') as DateRange;
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          message: "User not found", 
          success: false 
        });
      }
      
      // Generate user insights
      const insights = generateUserInsights(usageData, userId, range);
      
      return res.json({
        insights,
        success: true
      });
    } catch (error: any) {
      console.error("Error generating user insights:", error);
      return res.status(500).json({ 
        message: "Failed to generate user insights", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  // Prompt Quality Analyzer API
  app.post("/api/prompts/analyze-quality", async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1, "Prompt is required")
      });
      
      const { prompt } = schema.parse(req.body);
      
      // Analyze the prompt quality
      const qualityFeedback = analyzePromptQuality(prompt);
      
      return res.json({
        ...qualityFeedback,
        success: true
      });
    } catch (error: any) {
      console.error("Error analyzing prompt quality:", error);
      return res.status(400).json({ 
        message: "Failed to analyze prompt quality", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  // Advanced prompt generation API
  app.post("/api/prompts/generate", async (req, res) => {
    try {
      // Validate the request body
      const schema = z.object({
        topic: z.string().min(1, "Topic is required"),
        templateType: z.string().optional(),
        role: z.enum(["writer", "designer", "developer", "marketer"]).default("writer"),
        tone: z.string().optional(),
        industry: z.string().optional(),
        useEnhancedAlgorithm: z.boolean().default(false),
        save: z.boolean().default(false)
      });
      
      const { topic, templateType, role, tone, industry, useEnhancedAlgorithm, save } = schema.parse(req.body);
      
      // Check if pro features are requested (advanced AI)
      const clerkId = req.headers["x-clerk-user-id"] as string;
      let user = null;
      
      // If user requests enhanced algorithm or saving, we need to check authentication and plan
      if (useEnhancedAlgorithm || save) {
        if (!clerkId) {
          return res.status(401).json({ 
            message: "Authentication required for advanced features",
            success: false
          });
        }
        
        user = await storage.getUserByClerkId(clerkId);
        
        if (!user) {
          return res.status(404).json({ 
            message: "User not found",
            success: false
          });
        }
        
        // Enhanced algorithm is only for pro users
        if (useEnhancedAlgorithm && user.plan !== "pro") {
          return res.status(403).json({ 
            message: "Enhanced prompt generation features require a Pro subscription",
            success: false
          });
        }
        
        // Check prompt limits for free users
        if (user.plan === "free") {
          const today = new Date();
          const lastPromptDate = user.lastPromptDate ? new Date(user.lastPromptDate) : null;
          
          // Reset counter if it's a new day
          if (!lastPromptDate || !isSameDay(today, lastPromptDate)) {
            await storage.resetUserPromptUsage(user.id);
          } else if ((user.promptsUsedToday || 0) >= FREE_TIER_DAILY_LIMIT) {
            return res.status(402).json({ 
              message: "Free tier daily limit reached",
              limit: FREE_TIER_DAILY_LIMIT,
              success: false
            });
          }
        }
      }
      
      // Generate the prompt
      const result = generatePrompt({
        topic,
        templateType: templateType as PromptTemplateType,
        role,
        tone,
        industry,
        useEnhancedAlgorithm: useEnhancedAlgorithm && user?.plan === "pro"
      });
      
      // Save to database if requested and user is authenticated
      if (save && user) {
        // Increment usage and create prompt in database
        await storage.incrementUserPromptUsage(user.id);
        
        const savedPrompt = await storage.createPrompt({
          userId: user.id,
          originalPrompt: result.prompt,
          enhancedPrompt: result.enhancedPrompt.enhanced,
          role
        });
        
        return res.json({
          ...result,
          saved: true,
          promptId: savedPrompt.id,
          success: true
        });
      }
      
      // Return the generated prompt
      return res.json({
        ...result,
        saved: false,
        success: true
      });
    } catch (error: any) {
      console.error("Error generating prompt:", error);
      return res.status(400).json({ 
        message: "Failed to generate prompt", 
        error: error.message || "Unknown error occurred",
        success: false
      });
    }
  });
  
  // API to check if enhanced prompt algorithm is available
  app.get("/api/system/prompt-engine-status", async (req, res) => {
    // Our custom prompt engine is always available
    return res.json({
      enhancedAlgorithmAvailable: true,
      templateTypes: [
        "blog", "technical", "creative", "marketing", 
        "email", "social", "presentation", "product"
      ],
      tones: ["professional", "conversational", "persuasive", "instructional", "inspirational"],
      industries: [
        "technology", "healthcare", "education", "finance", 
        "ecommerce", "entertainment", "nonprofit"
      ],
      success: true
    });
  });
  // User routes
  app.post("/api/users/clerk", async (req, res) => {
    try {
      const schema = z.object({
        clerkId: z.string(),
        email: z.string().email(),
      });
      
      const { clerkId, email } = schema.parse(req.body);
      
      // Find user or create a new one
      let user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        user = await storage.createUser({
          username: email,
          password: "", // Not using password with Clerk
          clerkId,
          plan: "free",
        });
      }
      
      res.json({ user });
    } catch (error) {
      console.error("Error creating/fetching user:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });
  
  app.post("/api/users/onboarding", async (req, res) => {
    try {
      const schema = z.object({
        userId: z.string(),
        role: z.enum(["writer", "designer", "developer", "marketer"]),
      });
      
      const { userId, role } = schema.parse(req.body);
      
      const user = await storage.getUserByClerkId(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.updateUserRole(user.id, role);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });
  
  app.get("/api/users/me", async (req, res) => {
    try {
      const clerkId = req.headers["x-clerk-user-id"] as string;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        role: user.role || "writer",
        plan: user.plan,
        promptsUsedToday: user.promptsUsedToday || 0,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Prompt routes
  app.post("/api/prompts/enhance", async (req, res) => {
    try {
      const schema = z.object({
        originalPrompt: z.string(),
        enhancedPrompt: z.string(),
        role: z.enum(["writer", "designer", "developer", "marketer"]),
      });
      
      const { originalPrompt, enhancedPrompt, role } = schema.parse(req.body);
      const clerkId = req.headers["x-clerk-user-id"] as string;
      
      if (!clerkId) {
        // Allow anonymous usage with limited features
        return res.json({ 
          originalPrompt,
          enhancedPrompt,
          saved: false
        });
      }
      
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if free tier user has reached daily limit
      if (user.plan === "free") {
        const today = new Date();
        const lastPromptDate = user.lastPromptDate ? new Date(user.lastPromptDate) : null;
        
        // Reset counter if it's a new day
        if (!lastPromptDate || !isSameDay(today, lastPromptDate)) {
          await storage.resetUserPromptUsage(user.id);
        } else if ((user.promptsUsedToday || 0) >= FREE_TIER_DAILY_LIMIT) {
          return res.status(402).json({ 
            message: "Free tier daily limit reached",
            limit: FREE_TIER_DAILY_LIMIT
          });
        }
      }
      
      // Increment usage and update last prompt date
      await storage.incrementUserPromptUsage(user.id);
      
      // Create the prompt record
      const prompt = await storage.createPrompt({
        userId: user.id,
        originalPrompt,
        enhancedPrompt,
        role,
      });
      
      res.json({
        promptId: prompt.id,
        originalPrompt,
        enhancedPrompt,
        saved: true
      });
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });
  
  app.post("/api/prompts/save", async (req, res) => {
    try {
      const schema = z.object({
        originalPrompt: z.string(),
        enhancedPrompt: z.string(),
        role: z.enum(["writer", "designer", "developer", "marketer"]),
      });
      
      const { originalPrompt, enhancedPrompt, role } = schema.parse(req.body);
      const clerkId = req.headers["x-clerk-user-id"] as string;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create the prompt record
      const prompt = await storage.createPrompt({
        userId: user.id,
        originalPrompt,
        enhancedPrompt,
        role,
      });
      
      res.json({
        promptId: prompt.id,
        success: true
      });
    } catch (error) {
      console.error("Error saving prompt:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });
  
  app.get("/api/prompts/history", async (req, res) => {
    try {
      const clerkId = req.headers["x-clerk-user-id"] as string;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get limit parameter - if free tier, limit to 7 days
      const limitDays = user.plan === "free" ? 7 : undefined;
      
      const prompts = await storage.getPromptsByUserId(user.id, limitDays);
      
      res.json({ prompts });
    } catch (error) {
      console.error("Error fetching prompt history:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      const clerkId = req.headers["x-clerk-user-id"] as string;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const prompt = await storage.getPromptById(promptId);
      
      if (!prompt || prompt.userId !== user.id) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      res.json({ prompt });
    } catch (error) {
      console.error("Error fetching prompt:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/prompts/:id", async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      const clerkId = req.headers["x-clerk-user-id"] as string;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const prompt = await storage.getPromptById(promptId);
      
      if (!prompt || prompt.userId !== user.id) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      await storage.deletePrompt(promptId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting prompt:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Usage stats routes
  app.get("/api/stats/usage", async (req, res) => {
    try {
      const clerkId = req.headers["x-clerk-user-id"] as string;
      
      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUserByClerkId(clerkId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const stats = await storage.getUserUsageStats(user.id);
      
      res.json({
        ...stats,
        plan: user.plan,
        dailyLimit: user.plan === "free" ? FREE_TIER_DAILY_LIMIT : null,
        promptsUsedToday: user.promptsUsedToday || 0
      });
    } catch (error) {
      console.error("Error fetching usage stats:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to check if two dates are on the same day
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
