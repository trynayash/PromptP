/**
 * Template Manager
 * 
 * This module handles creating, managing, and applying prompt templates
 * with support for dynamic variables.
 */

import { UserRole } from "./ai-engine";

// Interface for a variable in a template
export interface TemplateVariable {
  id: string;
  name: string;
  description: string;
  defaultValue: string;
  required: boolean;
}

// Interface for a saved template
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  role: UserRole;
  category: string;
  tags: string[];
  content: string;
  variables: TemplateVariable[];
  usageCount: number;
  isPublic: boolean;
  version: number;
  previousVersionId?: string;
}

// Interface for template creation
export interface CreateTemplateInput {
  name: string;
  description: string;
  userId: number;
  role: UserRole;
  category: string;
  tags: string[];
  content: string;
  isPublic: boolean;
}

// Interface for template variable values when applying a template
export interface TemplateVariableValue {
  id: string;
  value: string;
}

// Generate a unique ID for templates and variables
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Extract potential variables from a template content
 * Variables are in the format {{variable_name}}
 */
export function extractVariablesFromContent(content: string): TemplateVariable[] {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables: TemplateVariable[] = [];
  const variableNames = new Set<string>();
  
  let match;
  while ((match = variableRegex.exec(content)) !== null) {
    const name = match[1].trim();
    
    // Skip if we already have this variable
    if (variableNames.has(name)) {
      continue;
    }
    
    variableNames.add(name);
    
    variables.push({
      id: generateId(),
      name,
      description: `Value for ${name}`,
      defaultValue: '',
      required: true
    });
  }
  
  return variables;
}

/**
 * Create a new template from content
 */
export function createTemplate(input: CreateTemplateInput): PromptTemplate {
  const now = new Date();
  const variables = extractVariablesFromContent(input.content);
  
  return {
    id: generateId(),
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now,
    userId: input.userId,
    role: input.role,
    category: input.category,
    tags: input.tags,
    content: input.content,
    variables,
    usageCount: 0,
    isPublic: input.isPublic,
    version: 1
  };
}

/**
 * Create a new version of an existing template
 */
export function createTemplateVersion(
  existingTemplate: PromptTemplate, 
  updates: Partial<CreateTemplateInput>
): PromptTemplate {
  const now = new Date();
  
  // Determine if content changed, and if so, re-extract variables
  const contentChanged = updates.content && updates.content !== existingTemplate.content;
  const variables = contentChanged 
    ? extractVariablesFromContent(updates.content as string)
    : existingTemplate.variables;
  
  return {
    id: generateId(),
    name: updates.name || existingTemplate.name,
    description: updates.description || existingTemplate.description,
    createdAt: existingTemplate.createdAt, // Keep original creation date
    updatedAt: now,
    userId: existingTemplate.userId,
    role: updates.role || existingTemplate.role,
    category: updates.category || existingTemplate.category,
    tags: updates.tags || existingTemplate.tags,
    content: updates.content || existingTemplate.content,
    variables,
    usageCount: 0, // Reset usage count for new version
    isPublic: 'isPublic' in updates ? updates.isPublic as boolean : existingTemplate.isPublic,
    version: existingTemplate.version + 1,
    previousVersionId: existingTemplate.id
  };
}

/**
 * Apply variable values to a template
 */
export function applyTemplate(
  template: PromptTemplate, 
  variableValues: TemplateVariableValue[]
): string {
  let result = template.content;
  
  // Create a map of variable IDs to values
  const valueMap = new Map<string, string>();
  variableValues.forEach(variable => {
    valueMap.set(variable.id, variable.value);
  });
  
  // Replace each variable with its value
  template.variables.forEach(variable => {
    const value = valueMap.get(variable.id) || variable.defaultValue;
    const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

/**
 * Compare two versions of a template and highlight differences
 */
export function compareTemplateVersions(
  version1: PromptTemplate,
  version2: PromptTemplate
): {
  nameChanged: boolean;
  descriptionChanged: boolean;
  contentDiff: { added: string[]; removed: string[]; };
  variablesAdded: TemplateVariable[];
  variablesRemoved: TemplateVariable[];
} {
  // Compare name and description
  const nameChanged = version1.name !== version2.name;
  const descriptionChanged = version1.description !== version2.description;
  
  // Simple line-by-line diff for content
  const lines1 = version1.content.split('\n');
  const lines2 = version2.content.split('\n');
  
  const added = lines2.filter(line => !lines1.includes(line));
  const removed = lines1.filter(line => !lines2.includes(line));
  
  // Compare variables
  const varNames1 = new Set(version1.variables.map(v => v.name));
  const varNames2 = new Set(version2.variables.map(v => v.name));
  
  const variablesAdded = version2.variables.filter(v => !varNames1.has(v.name));
  const variablesRemoved = version1.variables.filter(v => !varNames2.has(v.name));
  
  return {
    nameChanged,
    descriptionChanged,
    contentDiff: { added, removed },
    variablesAdded,
    variablesRemoved
  };
}

/**
 * Find and validate all variable references in a template
 */
export function validateTemplate(template: PromptTemplate): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Extract all variable references from the content
  const variableReferences = extractVariablesFromContent(template.content);
  const definedVariables = new Set(template.variables.map(v => v.name));
  
  // Check for variables in content that aren't defined
  const undefinedVars = variableReferences.filter(v => !definedVariables.has(v.name));
  if (undefinedVars.length > 0) {
    undefinedVars.forEach(v => {
      errors.push(`Variable {{${v.name}}} is used in the template but not defined`);
    });
  }
  
  // Check for defined variables that aren't used in content
  const definedVarsList = [...template.variables];
  const unusedVars = definedVarsList.filter(v => !variableReferences.some(ref => ref.name === v.name));
  if (unusedVars.length > 0) {
    unusedVars.forEach(v => {
      warnings.push(`Variable '${v.name}' is defined but not used in the template`);
    });
  }
  
  // Check for empty variable names
  if (template.variables.some(v => v.name.trim() === '')) {
    errors.push('Empty variable names are not allowed');
  }
  
  // Check for duplicate variable names
  const varNames = template.variables.map(v => v.name);
  const duplicates = varNames.filter((name, index) => varNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    duplicates.forEach(name => {
      errors.push(`Duplicate variable name: ${name}`);
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Group templates by category for easier navigation
 */
export function groupTemplatesByCategory(templates: PromptTemplate[]): Record<string, PromptTemplate[]> {
  const grouped: Record<string, PromptTemplate[]> = {};
  
  templates.forEach(template => {
    const category = template.category || 'Uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(template);
  });
  
  return grouped;
}

/**
 * Search templates by keywords, tags or variable names
 */
export function searchTemplates(
  templates: PromptTemplate[], 
  query: string
): PromptTemplate[] {
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  
  if (searchTerms.length === 0) {
    return templates;
  }
  
  return templates.filter(template => {
    // Search in template name and description
    const nameMatches = searchTerms.some(term => template.name.toLowerCase().includes(term));
    const descMatches = searchTerms.some(term => template.description.toLowerCase().includes(term));
    
    // Search in tags
    const tagMatches = template.tags.some(tag => 
      searchTerms.some(term => tag.toLowerCase().includes(term))
    );
    
    // Search in variable names
    const varMatches = template.variables.some(variable => 
      searchTerms.some(term => variable.name.toLowerCase().includes(term))
    );
    
    // Search in content
    const contentMatches = searchTerms.some(term => template.content.toLowerCase().includes(term));
    
    return nameMatches || descMatches || tagMatches || varMatches || contentMatches;
  });
}

/**
 * Get popular templates based on usage count
 */
export function getPopularTemplates(templates: PromptTemplate[], limit: number = 5): PromptTemplate[] {
  return [...templates]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

/**
 * Get recently updated templates
 */
export function getRecentTemplates(templates: PromptTemplate[], limit: number = 5): PromptTemplate[] {
  return [...templates]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);
}

/**
 * Get recommended templates for a user based on their role and usage patterns
 */
export function getRecommendedTemplates(
  templates: PromptTemplate[],
  userRole: UserRole,
  userUsedTemplateIds: string[] = [],
  limit: number = 5
): PromptTemplate[] {
  // Filter to only include templates not yet used by the user
  const unusedTemplates = templates.filter(t => !userUsedTemplateIds.includes(t.id));
  
  // First, prioritize templates that match the user's role
  const roleTemplates = unusedTemplates.filter(t => t.role === userRole);
  
  // Sort by popularity (usage count)
  const sorted = roleTemplates.sort((a, b) => b.usageCount - a.usageCount);
  
  // If we don't have enough role-specific templates, add other popular ones
  if (sorted.length < limit) {
    const otherPopular = unusedTemplates
      .filter(t => t.role !== userRole)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit - sorted.length);
    
    return [...sorted, ...otherPopular];
  }
  
  return sorted.slice(0, limit);
}