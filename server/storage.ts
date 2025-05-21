import { users, type User, type InsertUser, prompts, type Prompt, type InsertPrompt } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByClerkId(clerkId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: number, role: string): Promise<User>;
  resetUserPromptUsage(userId: number): Promise<void>;
  incrementUserPromptUsage(userId: number): Promise<void>;
  
  // Prompt operations
  getPromptById(id: number): Promise<Prompt | undefined>;
  getPromptsByUserId(userId: number, limitDays?: number): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  deletePrompt(id: number): Promise<void>;
  
  // Stats operations
  getUserUsageStats(userId: number): Promise<{
    totalPrompts: number;
    lastWeekPrompts: number;
    roleBreakdown: Record<string, number>;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private prompts: Map<number, Prompt>;
  private userIdCounter: number;
  private promptIdCounter: number;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.userIdCounter = 1;
    this.promptIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.clerkId === clerkId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    // Create a properly typed user with default values for required fields
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      clerkId: insertUser.clerkId || null,
      role: (insertUser.role as "writer" | "designer" | "developer" | "marketer") || null,
      plan: (insertUser.plan as "free" | "pro") || "free",
      promptsUsedToday: 0,
      lastPromptDate: now,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUserRole(userId: number, role: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, role: role as any };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async resetUserPromptUsage(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { 
      ...user, 
      promptsUsedToday: 0,
      lastPromptDate: new Date()
    };
    this.users.set(userId, updatedUser);
  }
  
  async incrementUserPromptUsage(userId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { 
      ...user, 
      promptsUsedToday: (user.promptsUsedToday || 0) + 1,
      lastPromptDate: new Date()
    };
    this.users.set(userId, updatedUser);
  }

  // Prompt operations
  async getPromptById(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }
  
  async getPromptsByUserId(userId: number, limitDays?: number): Promise<Prompt[]> {
    let userPrompts = Array.from(this.prompts.values())
      .filter(prompt => prompt.userId === userId)
      .sort((a, b) => {
        // Sort by created date, newest first
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    
    // Apply limit for free tier users (last 7 days)
    if (limitDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - limitDays);
      
      userPrompts = userPrompts.filter(prompt => {
        const promptDate = prompt.createdAt ? new Date(prompt.createdAt) : new Date();
        return promptDate >= cutoffDate;
      });
    }
    
    return userPrompts;
  }
  
  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.promptIdCounter++;
    const now = new Date();
    
    // Create a properly typed prompt with properly typed values
    const prompt: Prompt = { 
      id, 
      originalPrompt: insertPrompt.originalPrompt,
      enhancedPrompt: insertPrompt.enhancedPrompt,
      role: (insertPrompt.role as "writer" | "designer" | "developer" | "marketer") || null,
      userId: insertPrompt.userId || null,
      createdAt: now 
    };
    
    this.prompts.set(id, prompt);
    return prompt;
  }
  
  async deletePrompt(id: number): Promise<void> {
    this.prompts.delete(id);
  }
  
  // Stats operations
  async getUserUsageStats(userId: number): Promise<{
    totalPrompts: number;
    lastWeekPrompts: number;
    roleBreakdown: Record<string, number>;
  }> {
    const userPrompts = Array.from(this.prompts.values())
      .filter(prompt => prompt.userId === userId);
    
    // Calculate total prompts
    const totalPrompts = userPrompts.length;
    
    // Calculate prompts from the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const lastWeekPrompts = userPrompts.filter(prompt => {
      const promptDate = prompt.createdAt ? new Date(prompt.createdAt) : new Date();
      return promptDate >= oneWeekAgo;
    }).length;
    
    // Calculate role breakdown
    const roleBreakdown: Record<string, number> = {};
    userPrompts.forEach(prompt => {
      const role = prompt.role || "unknown";
      roleBreakdown[role] = (roleBreakdown[role] || 0) + 1;
    });
    
    return {
      totalPrompts,
      lastWeekPrompts,
      roleBreakdown
    };
  }
}

export const storage = new MemStorage();
