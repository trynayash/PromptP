/**
 * Prompt Block Builder
 * 
 * This module splits prompts into editable component blocks and allows
 * users to fine-tune individual parts of a prompt.
 */

// Types of blocks that can be part of a prompt
export type PromptBlockType = 
  | 'context'
  | 'goal'
  | 'tone'
  | 'audience'
  | 'constraints'
  | 'format'
  | 'examples'
  | 'custom';

// Interface for a prompt block
export interface PromptBlock {
  id: string;
  type: PromptBlockType;
  content: string;
  order: number;
  required: boolean;
  description: string;
}

// Block template with predefined structure
export interface BlockTemplate {
  type: PromptBlockType;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  defaultContent?: string;
}

// Interface for a complete prompt structure
export interface PromptStructure {
  blocks: PromptBlock[];
  combinedPrompt: string;
}

// Default templates for different block types
const blockTemplates: Record<PromptBlockType, BlockTemplate> = {
  context: {
    type: 'context',
    label: 'Context',
    description: 'Background information and context for the prompt',
    placeholder: 'Provide background information about the project, situation, or problem...',
    required: true,
    defaultContent: 'I am working on a project that requires...'
  },
  goal: {
    type: 'goal',
    label: 'Goal',
    description: 'The main objective or purpose of the prompt',
    placeholder: 'Describe what you want to achieve with this prompt...',
    required: true,
    defaultContent: 'The goal is to create...'
  },
  tone: {
    type: 'tone',
    label: 'Tone',
    description: 'The tone and style of the response',
    placeholder: 'Specify the desired tone (professional, casual, technical, etc.)...',
    required: false,
    defaultContent: 'Use a professional tone with...'
  },
  audience: {
    type: 'audience',
    label: 'Audience',
    description: 'The target audience for the content',
    placeholder: 'Describe who the content is for...',
    required: false,
    defaultContent: 'The target audience consists of...'
  },
  constraints: {
    type: 'constraints',
    label: 'Constraints',
    description: 'Limitations, requirements, or boundaries',
    placeholder: 'List any constraints or limitations...',
    required: false,
    defaultContent: 'Must adhere to the following constraints...'
  },
  format: {
    type: 'format',
    label: 'Format',
    description: 'The desired format or structure of the output',
    placeholder: 'Specify the format (bullet points, paragraphs, table, etc.)...',
    required: false,
    defaultContent: 'Format the output as...'
  },
  examples: {
    type: 'examples',
    label: 'Examples',
    description: 'Examples or references to clarify expectations',
    placeholder: 'Provide examples or references...',
    required: false,
    defaultContent: 'For reference, here are some examples...'
  },
  custom: {
    type: 'custom',
    label: 'Custom',
    description: 'Custom section for additional information',
    placeholder: 'Add any additional information...',
    required: false
  }
};

// Generate a unique ID for blocks
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Create a new prompt block from a template
 */
export function createBlock(type: PromptBlockType, order: number = 0, content?: string): PromptBlock {
  const template = blockTemplates[type];
  
  return {
    id: generateId(),
    type,
    content: content || template.defaultContent || '',
    order,
    required: template.required,
    description: template.description
  };
}

/**
 * Get all available block templates
 */
export function getBlockTemplates(): Record<PromptBlockType, BlockTemplate> {
  return { ...blockTemplates };
}

/**
 * Extract potential blocks from an existing prompt
 */
export function extractBlocksFromPrompt(prompt: string): PromptBlock[] {
  const blocks: PromptBlock[] = [];
  let order = 0;
  
  // Check for context
  const contextRegex = /(?:context|background|situation)(?:\s*:|)\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i;
  const contextMatch = prompt.match(contextRegex);
  if (contextMatch) {
    blocks.push(createBlock('context', order++, contextMatch[1].trim()));
  } else {
    // Add default context block if none found
    blocks.push(createBlock('context', order++));
  }
  
  // Check for goal/objective
  const goalRegex = /(?:goal|objective|purpose|aim)(?:\s*:|)\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i;
  const goalMatch = prompt.match(goalRegex);
  if (goalMatch) {
    blocks.push(createBlock('goal', order++, goalMatch[1].trim()));
  } else {
    // Extract first paragraph as goal if no explicit goal found
    const firstParagraph = prompt.split(/\n\s*\n/)[0];
    if (firstParagraph && !contextMatch?.includes(firstParagraph)) {
      blocks.push(createBlock('goal', order++, firstParagraph.trim()));
    } else {
      blocks.push(createBlock('goal', order++));
    }
  }
  
  // Check for tone
  const toneRegex = /(?:tone|style|voice)(?:\s*:|)\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i;
  const toneMatch = prompt.match(toneRegex);
  if (toneMatch) {
    blocks.push(createBlock('tone', order++, toneMatch[1].trim()));
  }
  
  // Check for audience
  const audienceRegex = /(?:audience|reader|user|customer|demographic)(?:\s*:|)\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i;
  const audienceMatch = prompt.match(audienceRegex);
  if (audienceMatch) {
    blocks.push(createBlock('audience', order++, audienceMatch[1].trim()));
  }
  
  // Check for constraints
  const constraintsRegex = /(?:constraint|limitation|restriction|requirement|avoid)(?:\s*:|)\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i;
  const constraintsMatch = prompt.match(constraintsRegex);
  if (constraintsMatch) {
    blocks.push(createBlock('constraints', order++, constraintsMatch[1].trim()));
  }
  
  // Check for format
  const formatRegex = /(?:format|structure|layout|organize)(?:\s*:|)\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i;
  const formatMatch = prompt.match(formatRegex);
  if (formatMatch) {
    blocks.push(createBlock('format', order++, formatMatch[1].trim()));
  }
  
  // Check for examples
  const examplesRegex = /(?:example|reference|sample|instance)(?:\s*:|)\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i;
  const examplesMatch = prompt.match(examplesRegex);
  if (examplesMatch) {
    blocks.push(createBlock('examples', order++, examplesMatch[1].trim()));
  }
  
  // If we couldn't extract much, add any remaining text as a custom block
  if (blocks.length <= 2) {
    const existingContent = blocks.map(b => b.content).join(' ');
    const remainingContent = prompt.replace(existingContent, '').trim();
    
    if (remainingContent) {
      blocks.push(createBlock('custom', order++, remainingContent));
    }
  }
  
  return blocks;
}

/**
 * Create a default prompt structure with common blocks
 */
export function createDefaultPromptStructure(): PromptStructure {
  const blocks: PromptBlock[] = [
    createBlock('context', 0),
    createBlock('goal', 1),
    createBlock('audience', 2),
    createBlock('tone', 3),
    createBlock('format', 4),
    createBlock('constraints', 5)
  ];
  
  return {
    blocks,
    combinedPrompt: combineBlocks(blocks)
  };
}

/**
 * Combine blocks into a single prompt
 */
export function combineBlocks(blocks: PromptBlock[]): string {
  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  
  // Combine blocks with appropriate headers
  return sortedBlocks
    .filter(block => block.content.trim() !== '')
    .map(block => {
      const blockTemplate = blockTemplates[block.type];
      return `${blockTemplate.label}:\n${block.content}`;
    })
    .join('\n\n');
}

/**
 * Update a specific block in a prompt structure
 */
export function updateBlock(
  promptStructure: PromptStructure, 
  blockId: string, 
  content: string
): PromptStructure {
  const updatedBlocks = promptStructure.blocks.map(block => {
    if (block.id === blockId) {
      return { ...block, content };
    }
    return block;
  });
  
  return {
    blocks: updatedBlocks,
    combinedPrompt: combineBlocks(updatedBlocks)
  };
}

/**
 * Add a new block to a prompt structure
 */
export function addBlock(
  promptStructure: PromptStructure, 
  blockType: PromptBlockType
): PromptStructure {
  const maxOrder = Math.max(...promptStructure.blocks.map(b => b.order), -1);
  const newBlock = createBlock(blockType, maxOrder + 1);
  
  const updatedBlocks = [...promptStructure.blocks, newBlock];
  
  return {
    blocks: updatedBlocks,
    combinedPrompt: combineBlocks(updatedBlocks)
  };
}

/**
 * Remove a block from a prompt structure
 */
export function removeBlock(
  promptStructure: PromptStructure, 
  blockId: string
): PromptStructure {
  // Find the block to check if it's required
  const blockToRemove = promptStructure.blocks.find(b => b.id === blockId);
  
  // Don't allow removing required blocks
  if (blockToRemove?.required) {
    return promptStructure;
  }
  
  const updatedBlocks = promptStructure.blocks.filter(block => block.id !== blockId);
  
  return {
    blocks: updatedBlocks,
    combinedPrompt: combineBlocks(updatedBlocks)
  };
}

/**
 * Reorder blocks in a prompt structure
 */
export function reorderBlocks(
  promptStructure: PromptStructure, 
  blockId: string, 
  newOrder: number
): PromptStructure {
  // Find the block to move
  const blockToMove = promptStructure.blocks.find(b => b.id === blockId);
  
  if (!blockToMove) {
    return promptStructure;
  }
  
  // Update orders for all blocks
  const updatedBlocks = promptStructure.blocks.map(block => {
    if (block.id === blockId) {
      return { ...block, order: newOrder };
    }
    
    // Shift other blocks as needed
    if (blockToMove.order < newOrder && block.order > blockToMove.order && block.order <= newOrder) {
      return { ...block, order: block.order - 1 };
    }
    
    if (blockToMove.order > newOrder && block.order >= newOrder && block.order < blockToMove.order) {
      return { ...block, order: block.order + 1 };
    }
    
    return block;
  });
  
  return {
    blocks: updatedBlocks,
    combinedPrompt: combineBlocks(updatedBlocks)
  };
}