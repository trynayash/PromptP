import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { enhancePrompt } from "./ai-engine";
import { z } from "zod";
import { insertPromptSchema } from "@shared/schema";

// Daily prompt limit for free users
const FREE_TIER_DAILY_LIMIT = 10;

export async function registerRoutes(app: Express): Promise<Server> {
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
