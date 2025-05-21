/**
 * Analytics Engine
 * 
 * This module provides analytics capabilities for tracking and
 * visualizing prompt usage patterns and insights.
 */

import { UserRole } from "./ai-engine";
import { PromptTemplateType } from "./custom-prompt-engine";

// Interface for usage data point
export interface UsageDataPoint {
  timestamp: Date;
  userId: number;
  promptId?: number;
  templateId?: string;
  role: UserRole;
  promptType?: PromptTemplateType;
  category?: string;
  tags?: string[];
  enhancementScore?: number;
  wordCountBefore?: number;
  wordCountAfter?: number;
  sessionDuration?: number; // In seconds
}

// Interface for aggregated heatmap data
export interface HeatmapData {
  // X-axis: Time periods (days, weeks, months)
  timePeriods: string[];
  // Y-axis: Categories (roles, prompt types, etc.)
  categories: string[];
  // Values: 2D array of usage counts
  values: number[][];
}

// Interface for usage trend data
export interface UsageTrendData {
  timeLabels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// Interface for usage breakdown
export interface UsageBreakdownData {
  labels: string[];
  values: number[];
  colors?: string[];
}

// Interface for word count statistics
export interface WordCountStats {
  averageBefore: number;
  averageAfter: number;
  percentageIncrease: number;
  distribution: {
    range: string;
    count: number;
  }[];
}

// Date range for filtering analytics
export type DateRange = 
  | 'today' 
  | 'yesterday'
  | 'last7days' 
  | 'last30days' 
  | 'thisMonth' 
  | 'lastMonth' 
  | 'thisYear'
  | 'custom';

// Interface for custom date range
export interface CustomDateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Filter usage data based on date range
 */
export function filterByDateRange(
  data: UsageDataPoint[], 
  range: DateRange,
  customRange?: CustomDateRange
): UsageDataPoint[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date;
  let endDate: Date = new Date(now.getTime() + 86400000); // End of today
  
  switch(range) {
    case 'today':
      startDate = today;
      break;
    case 'yesterday':
      startDate = new Date(today.getTime() - 86400000);
      endDate = today;
      break;
    case 'last7days':
      startDate = new Date(today.getTime() - 86400000 * 7);
      break;
    case 'last30days':
      startDate = new Date(today.getTime() - 86400000 * 30);
      break;
    case 'thisMonth':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'lastMonth':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'thisYear':
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    case 'custom':
      if (!customRange) {
        throw new Error('Custom date range required');
      }
      startDate = customRange.startDate;
      endDate = new Date(customRange.endDate.getTime() + 86400000); // End of end date
      break;
    default:
      startDate = new Date(today.getTime() - 86400000 * 30); // Default to last 30 days
  }
  
  return data.filter(point => {
    const timestamp = new Date(point.timestamp);
    return timestamp >= startDate && timestamp < endDate;
  });
}

/**
 * Generate heatmap data for role and prompt type usage
 */
export function generateRolePromptHeatmap(
  data: UsageDataPoint[],
  range: DateRange,
  customRange?: CustomDateRange
): HeatmapData {
  // Filter data by date range
  const filteredData = filterByDateRange(data, range, customRange);
  
  // Get all unique roles and prompt types
  const roles = [...new Set(filteredData.map(d => d.role))];
  const promptTypes = [...new Set(filteredData
    .filter(d => d.promptType)
    .map(d => d.promptType))] as PromptTemplateType[];
  
  // Initialize values matrix with zeros
  const values: number[][] = Array(roles.length)
    .fill(0)
    .map(() => Array(promptTypes.length).fill(0));
  
  // Count occurrences
  filteredData.forEach(point => {
    if (point.promptType) {
      const roleIndex = roles.indexOf(point.role);
      const typeIndex = promptTypes.indexOf(point.promptType);
      if (roleIndex >= 0 && typeIndex >= 0) {
        values[roleIndex][typeIndex]++;
      }
    }
  });
  
  return {
    categories: roles,
    timePeriods: promptTypes,
    values
  };
}

/**
 * Generate time-based usage trends
 */
export function generateUsageTrends(
  data: UsageDataPoint[],
  range: DateRange,
  groupBy: 'day' | 'week' | 'month' = 'day',
  customRange?: CustomDateRange
): UsageTrendData {
  // Filter data by date range
  const filteredData = filterByDateRange(data, range, customRange);
  
  // Get all unique roles
  const roles = [...new Set(filteredData.map(d => d.role))];
  
  // Group data points by time periods
  const timeGroups = new Map<string, Map<UserRole, number>>();
  
  filteredData.forEach(point => {
    const date = new Date(point.timestamp);
    let timeKey: string;
    
    // Format time key based on grouping
    switch (groupBy) {
      case 'day':
        timeKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        break;
      case 'week':
        // Get week number (1-52)
        const weekNum = Math.ceil((((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7);
        timeKey = `${date.getFullYear()}-W${weekNum}`;
        break;
      case 'month':
        timeKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        break;
    }
    
    // Initialize or update count for this time period and role
    if (!timeGroups.has(timeKey)) {
      timeGroups.set(timeKey, new Map<UserRole, number>());
    }
    
    const roleMap = timeGroups.get(timeKey)!;
    roleMap.set(point.role, (roleMap.get(point.role) || 0) + 1);
  });
  
  // Sort time keys chronologically
  const sortedTimeKeys = [...timeGroups.keys()].sort();
  
  // Prepare datasets for each role
  const datasets = roles.map(role => {
    const data = sortedTimeKeys.map(timeKey => {
      const roleMap = timeGroups.get(timeKey);
      return roleMap ? (roleMap.get(role) || 0) : 0;
    });
    
    return {
      label: role,
      data
    };
  });
  
  return {
    timeLabels: sortedTimeKeys,
    datasets
  };
}

/**
 * Generate usage breakdown by category
 */
export function generateUsageBreakdown(
  data: UsageDataPoint[],
  breakdownBy: 'role' | 'promptType' | 'category' | 'tags',
  range: DateRange,
  customRange?: CustomDateRange
): UsageBreakdownData {
  // Filter data by date range
  const filteredData = filterByDateRange(data, range, customRange);
  
  // Prepare counts based on breakdown type
  const counts = new Map<string, number>();
  
  filteredData.forEach(point => {
    let key: string;
    
    switch (breakdownBy) {
      case 'role':
        key = point.role;
        break;
      case 'promptType':
        key = point.promptType || 'unknown';
        break;
      case 'category':
        key = point.category || 'uncategorized';
        break;
      case 'tags':
        // For tags, we'll count each tag separately
        if (point.tags && point.tags.length > 0) {
          point.tags.forEach(tag => {
            counts.set(tag, (counts.get(tag) || 0) + 1);
          });
          return; // Skip the normal counting below
        } else {
          key = 'untagged';
        }
        break;
    }
    
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  
  // Sort by count in descending order
  const sortedEntries = [...counts.entries()]
    .sort((a, b) => b[1] - a[1]);
  
  return {
    labels: sortedEntries.map(([label]) => label),
    values: sortedEntries.map(([_, value]) => value)
  };
}

/**
 * Generate word count statistics
 */
export function generateWordCountStats(
  data: UsageDataPoint[],
  range: DateRange,
  customRange?: CustomDateRange
): WordCountStats {
  // Filter data by date range
  const filteredData = filterByDateRange(data, range, customRange)
    .filter(d => d.wordCountBefore !== undefined && d.wordCountAfter !== undefined);
  
  if (filteredData.length === 0) {
    return {
      averageBefore: 0,
      averageAfter: 0,
      percentageIncrease: 0,
      distribution: []
    };
  }
  
  // Calculate averages
  const totalBefore = filteredData.reduce((sum, d) => sum + (d.wordCountBefore || 0), 0);
  const totalAfter = filteredData.reduce((sum, d) => sum + (d.wordCountAfter || 0), 0);
  
  const averageBefore = totalBefore / filteredData.length;
  const averageAfter = totalAfter / filteredData.length;
  
  // Calculate percentage increase
  const percentageIncrease = 
    averageBefore > 0 ? ((averageAfter - averageBefore) / averageBefore) * 100 : 0;
  
  // Create distribution ranges
  const ranges = [
    { min: 0, max: 10, label: '0-10 words' },
    { min: 11, max: 25, label: '11-25 words' },
    { min: 26, max: 50, label: '26-50 words' },
    { min: 51, max: 100, label: '51-100 words' },
    { min: 101, max: 200, label: '101-200 words' },
    { min: 201, max: 500, label: '201-500 words' },
    { min: 501, max: Infinity, label: '500+ words' }
  ];
  
  // Count prompts in each range
  const distribution = ranges.map(range => {
    const count = filteredData.filter(d => {
      const afterCount = d.wordCountAfter || 0;
      return afterCount >= range.min && afterCount <= range.max;
    }).length;
    
    return {
      range: range.label,
      count
    };
  });
  
  return {
    averageBefore,
    averageAfter,
    percentageIncrease,
    distribution
  };
}

/**
 * Generate usage data for specific users
 */
export function generateUserInsights(
  data: UsageDataPoint[],
  userId: number,
  range: DateRange,
  customRange?: CustomDateRange
): {
  totalUsage: number;
  favoriteTags: { tag: string, count: number }[];
  favoritePromptTypes: { type: string, count: number }[];
  averageEnhancementScore: number;
  engagementTrend: UsageTrendData;
} {
  // Filter data by user ID and date range
  const userData = filterByDateRange(data, range, customRange)
    .filter(d => d.userId === userId);
  
  // Calculate total usage
  const totalUsage = userData.length;
  
  // Find favorite tags
  const tagCounts = new Map<string, number>();
  userData.forEach(point => {
    if (point.tags) {
      point.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  });
  
  const favoriteTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
  
  // Find favorite prompt types
  const typeCounts = new Map<string, number>();
  userData.forEach(point => {
    if (point.promptType) {
      typeCounts.set(point.promptType, (typeCounts.get(point.promptType) || 0) + 1);
    }
  });
  
  const favoritePromptTypes = [...typeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));
  
  // Calculate average enhancement score
  const scoresData = userData.filter(d => d.enhancementScore !== undefined);
  const averageEnhancementScore = 
    scoresData.length > 0 
      ? scoresData.reduce((sum, d) => sum + (d.enhancementScore || 0), 0) / scoresData.length
      : 0;
  
  // Generate engagement trend (simplified)
  const engagementTrend = generateUsageTrends(userData, range, 'day', customRange);
  
  return {
    totalUsage,
    favoriteTags,
    favoritePromptTypes,
    averageEnhancementScore,
    engagementTrend
  };
}

/**
 * Log usage data for analytics
 */
export function logUsage(
  data: UsageDataPoint[]
): UsageDataPoint[] {
  return [...data];
}

/**
 * Track a new usage data point
 */
export function trackUsage(
  data: UsageDataPoint[],
  newPoint: UsageDataPoint
): UsageDataPoint[] {
  return [...data, newPoint];
}

/**
 * Cache for optimization
 */
const analyticsCache = new Map<string, any>();

/**
 * Get cached analytics or compute if not available
 */
export function getCachedAnalytics<T>(
  key: string,
  computeFn: () => T,
  maxAgeMs: number = 3600000 // 1 hour default
): T {
  const cached = analyticsCache.get(key);
  
  if (cached && (Date.now() - cached.timestamp < maxAgeMs)) {
    return cached.data as T;
  }
  
  // Compute new data
  const data = computeFn();
  
  // Cache the result
  analyticsCache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}