/**
 * Prompt Quality Analyzer
 * 
 * This module analyzes prompts and provides feedback on their quality
 * with actionable suggestions for improvement.
 */

// Types of quality issues that can be identified
export type QualityIssueType = 
  | 'clarity'
  | 'specificity' 
  | 'context' 
  | 'structure'
  | 'completeness'
  | 'tone'
  | 'technical';

// Interface for a quality issue with explanation and suggestion
export interface QualityIssue {
  type: QualityIssueType;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  suggestion: string;
  position?: {
    start: number;
    end: number;
  };
}

// Overall quality score and feedback
export interface PromptQualityFeedback {
  score: number; // 0-100
  issues: QualityIssue[];
  strengths: string[];
  overallFeedback: string;
}

// Patterns to identify different quality issues
const qualityPatterns = {
  clarity: {
    vague: [
      /\b(something|somehow|thing|stuff|etc\.?)\b/gi,
      /\b(good|nice|great|better|best|awesome|amazing)\b(?! practice)/gi,
      /\b(many|multiple|various|several|few|some)\b(?! of)/gi
    ],
    ambiguous: [
      /\b(it|they|them|those|these|this|that)\b(?! is| are| were| was)/gi,
      /\b(he|she|his|her|their|its)\b(?! is| are| were| was)/gi
    ]
  },
  specificity: {
    lacking: [
      /(?<!\d)\b(large|small|big|tiny|huge|enormous)\b/gi,
      /\b(quickly|slowly|fast|rapid|soon|recent)\b/gi,
      /\b(often|sometimes|frequently|occasionally|rarely)\b/gi
    ],
    measures: [
      /\d+\s*(%|percent|px|em|rem|seconds|minutes|hours|days|weeks|months|years)/gi,
      /\$\d+|[₿£€¥]\d+|\d+\s+(dollars|euros|pounds|yen)/gi,
      /\b\d+\s*(kb|mb|gb|tb)\b/gi
    ]
  },
  context: {
    missing: [
      /^(?!.*?\b(for|to use in|context|background|situation|scenario|setting|environment)\b).{0,50}$/i
    ],
    defined: [
      /\b(for|to use in)\s[^.]{5,50}(?=\.|$)/i,
      /\b(context|background|situation|scenario)\s*:\s*[^.]{5,100}(?=\.|$)/i
    ]
  },
  structure: {
    sections: [
      /\b(section|part|chapter|segment|module|component|phase|step)\s*\d+\b/gi,
      /\b(\d+)\.\s+\w+/gm,
      /\b(firstly|secondly|thirdly|finally|subsequently|moreover|furthermore)\b/gi
    ],
    formatting: [
      /-\s+\w+/gm,
      /\*\s+\w+/gm,
      /\d+\.\s+\w+/gm
    ]
  },
  completeness: {
    goals: [
      /\b(goal|objective|aim|purpose|target|intention|outcome)\b/gi
    ],
    constraints: [
      /\b(constraint|limitation|restriction|boundary|requirement|must not|should not|avoid)\b/gi
    ],
    audience: [
      /\b(audience|reader|viewer|user|customer|client|target market|demographic)\b/gi
    ]
  },
  tone: {
    formal: [
      /\b(please|kindly|respectfully|formally|professionally|accordingly)\b/gi,
      /\b(would like to|request that|appreciate if|grateful if)\b/gi
    ],
    informal: [
      /\b(hey|hi|yo|sup|cool|awesome|great|amazing|wow|yeah)\b/gi,
      /\b(btw|fyi|asap|lol|omg|idk|imo)\b/gi
    ],
    instructional: [
      /\b(must|should|need to|have to|required to|necessary to)\b/gi,
      /\b(step|process|procedure|method|approach|technique)\b/gi
    ]
  },
  technical: {
    terms: [
      /\b(API|SDK|UI|UX|CSS|HTML|JS|SQL|frontend|backend|database|algorithm|function|variable|parameter)\b/g,
      /\b(React|Angular|Vue|Node|Express|Django|Flask|Spring|Laravel)\b/g,
      /\b(AWS|Azure|GCP|Docker|Kubernetes|CI\/CD|DevOps)\b/g
    ]
  }
};

/**
 * Calculate a score for a specific aspect of quality
 */
function calculateAspectScore(text: string, patterns: RegExp[], positive: boolean = true): number {
  let matches = 0;
  
  for (const pattern of patterns) {
    const matchCount = (text.match(pattern) || []).length;
    matches += matchCount;
  }
  
  // For positive patterns (like structure, completeness), more matches = higher score
  // For negative patterns (like vagueness), more matches = lower score
  if (positive) {
    return Math.min(100, matches * 20); // Cap at 100
  } else {
    return Math.max(0, 100 - matches * 20); // Floor at 0
  }
}

/**
 * Identify quality issues in a prompt
 */
function identifyIssues(text: string): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const wordCount = text.split(/\s+/).length;
  
  // Check for clarity issues
  // Find vague terms
  const vagueMatches: number[] = [];
  qualityPatterns.clarity.vague.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index !== undefined) {
        vagueMatches.push(match.index);
      }
    }
  });
  
  // Find ambiguous pronouns
  const ambiguousMatches: number[] = [];
  qualityPatterns.clarity.ambiguous.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index !== undefined) {
        ambiguousMatches.push(match.index);
      }
    }
  });
  
  if (vagueMatches.length > 0) {
    issues.push({
      type: 'clarity',
      severity: vagueMatches.length > 3 ? 'high' : 'medium',
      explanation: 'Your prompt contains vague or imprecise language.',
      suggestion: 'Replace vague terms with specific, measurable descriptions. For example, use "increase conversion by 15%" instead of "make it better".'
    });
  }
  
  if (ambiguousMatches.length > 0) {
    issues.push({
      type: 'clarity',
      severity: ambiguousMatches.length > 3 ? 'high' : 'medium',
      explanation: 'Your prompt contains potentially ambiguous pronouns that could cause confusion.',
      suggestion: 'Replace pronouns like "it", "they" with the specific nouns they refer to.'
    });
  }
  
  // Check for specificity issues
  let lacksSpecificsCount = 0;
  qualityPatterns.specificity.lacking.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index !== undefined) {
        lacksSpecificsCount++;
      }
    }
  });
  
  let hasMeasuresCount = 0;
  qualityPatterns.specificity.measures.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match.index !== undefined) {
        hasMeasuresCount++;
      }
    }
  });
  
  if (lacksSpecificsCount > 2 && hasMeasuresCount === 0) {
    issues.push({
      type: 'specificity',
      severity: 'medium',
      explanation: 'Your prompt uses general descriptors without specific measurements or criteria.',
      suggestion: 'Add concrete numbers, percentages, dimensions, or time frames to clarify your expectations.'
    });
  }
  
  // Check for context issues
  const missingContextMatch = qualityPatterns.context.missing.some(pattern => pattern.test(text));
  const hasContextMatch = qualityPatterns.context.defined.some(pattern => pattern.test(text));
  
  if (missingContextMatch && !hasContextMatch && wordCount < 50) {
    issues.push({
      type: 'context',
      severity: 'high',
      explanation: 'Your prompt lacks context about the purpose or background of the request.',
      suggestion: 'Add information about why you need this, where it will be used, or what problem it solves.'
    });
  }
  
  // Check for structure issues
  const hasSectionsCount = qualityPatterns.structure.sections.flatMap(pattern => 
    [...text.matchAll(pattern)].map(match => match.index)
  ).filter(index => index !== undefined).length;
  
  const hasFormattingCount = qualityPatterns.structure.formatting.flatMap(pattern => 
    [...text.matchAll(pattern)].map(match => match.index)
  ).filter(index => index !== undefined).length;
  
  if (wordCount > 50 && hasSectionsCount === 0 && hasFormattingCount === 0) {
    issues.push({
      type: 'structure',
      severity: 'medium',
      explanation: 'Your prompt is long but lacks clear structure or formatting.',
      suggestion: 'Break down your request into numbered sections, bullet points, or clear paragraphs with headings.'
    });
  }
  
  // Check for completeness issues
  const hasGoals = qualityPatterns.completeness.goals.some(pattern => pattern.test(text));
  const hasConstraints = qualityPatterns.completeness.constraints.some(pattern => pattern.test(text));
  const hasAudience = qualityPatterns.completeness.audience.some(pattern => pattern.test(text));
  
  if (!hasGoals && wordCount > 20) {
    issues.push({
      type: 'completeness',
      severity: 'medium',
      explanation: 'Your prompt doesn\'t clearly state the goal or objective.',
      suggestion: 'Add a sentence about what you want to achieve or the purpose of this request.'
    });
  }
  
  if (!hasConstraints && wordCount > 30) {
    issues.push({
      type: 'completeness',
      severity: 'low',
      explanation: 'Your prompt doesn\'t mention any constraints or limitations.',
      suggestion: 'Consider adding boundaries like word count, format requirements, or things to avoid.'
    });
  }
  
  if (!hasAudience && wordCount > 40) {
    issues.push({
      type: 'completeness',
      severity: 'low',
      explanation: 'Your prompt doesn\'t specify the target audience or reader.',
      suggestion: 'Mention who the content is for to help tailor the tone and complexity appropriately.'
    });
  }
  
  return issues;
}

/**
 * Identify strengths in a prompt
 */
function identifyStrengths(text: string): string[] {
  const strengths: string[] = [];
  const wordCount = text.split(/\s+/).length;
  
  // Check for good structure
  const hasSectionsCount = qualityPatterns.structure.sections.flatMap(pattern => 
    [...text.matchAll(pattern)].map(match => match.index)
  ).filter(index => index !== undefined).length;
  
  const hasFormattingCount = qualityPatterns.structure.formatting.flatMap(pattern => 
    [...text.matchAll(pattern)].map(match => match.index)
  ).filter(index => index !== undefined).length;
  
  if (hasSectionsCount > 0 || hasFormattingCount > 0) {
    strengths.push('Good structure with clear sections or formatting');
  }
  
  // Check for specificity
  const hasMeasuresCount = qualityPatterns.specificity.measures.flatMap(pattern => 
    [...text.matchAll(pattern)].map(match => match.index)
  ).filter(index => index !== undefined).length;
  
  if (hasMeasuresCount > 0) {
    strengths.push('Includes specific measurements or criteria');
  }
  
  // Check for context
  const hasContextMatch = qualityPatterns.context.defined.some(pattern => pattern.test(text));
  
  if (hasContextMatch) {
    strengths.push('Provides clear context or background information');
  }
  
  // Check for completeness
  const hasGoals = qualityPatterns.completeness.goals.some(pattern => pattern.test(text));
  const hasConstraints = qualityPatterns.completeness.constraints.some(pattern => pattern.test(text));
  const hasAudience = qualityPatterns.completeness.audience.some(pattern => pattern.test(text));
  
  if (hasGoals) {
    strengths.push('Clearly states the goal or objective');
  }
  
  if (hasConstraints) {
    strengths.push('Includes constraints or boundaries');
  }
  
  if (hasAudience) {
    strengths.push('Specifies the target audience');
  }
  
  // Length assessment
  if (wordCount > 10 && wordCount < 20) {
    strengths.push('Concise and focused');
  } else if (wordCount >= 20 && wordCount <= 100) {
    strengths.push('Good level of detail without being excessive');
  } else if (wordCount > 100) {
    strengths.push('Comprehensive with substantial detail');
  }
  
  return strengths;
}

/**
 * Generate overall feedback based on the score
 */
function generateOverallFeedback(score: number, issueCount: number): string {
  if (score >= 90) {
    return 'Excellent prompt! Very clear, specific, and well-structured.';
  } else if (score >= 75) {
    return 'Good prompt with clear intent. A few minor improvements could make it even better.';
  } else if (score >= 60) {
    return 'Decent prompt that communicates the basic idea, but could benefit from more specificity and structure.';
  } else if (score >= 40) {
    return `Your prompt needs improvement in ${issueCount} areas. Consider adding more context and specific details.`;
  } else {
    return 'This prompt requires significant revision. Consider addressing the issues listed and providing much more context and specificity.';
  }
}

/**
 * Calculate the overall quality score based on various aspects
 */
function calculateOverallScore(text: string): number {
  const clarity = calculateAspectScore(text, [
    ...qualityPatterns.clarity.vague,
    ...qualityPatterns.clarity.ambiguous
  ], false);
  
  const specificity = 
    (calculateAspectScore(text, qualityPatterns.specificity.lacking, false) * 0.4) +
    (calculateAspectScore(text, qualityPatterns.specificity.measures, true) * 0.6);
  
  const hasContext = qualityPatterns.context.defined.some(pattern => pattern.test(text));
  const context = hasContext ? 80 : 40;
  
  const structure = 
    (calculateAspectScore(text, qualityPatterns.structure.sections, true) * 0.5) +
    (calculateAspectScore(text, qualityPatterns.structure.formatting, true) * 0.5);
  
  const hasGoals = qualityPatterns.completeness.goals.some(pattern => pattern.test(text));
  const hasConstraints = qualityPatterns.completeness.constraints.some(pattern => pattern.test(text));
  const hasAudience = qualityPatterns.completeness.audience.some(pattern => pattern.test(text));
  
  const completeness = 
    (hasGoals ? 40 : 0) +
    (hasConstraints ? 30 : 0) +
    (hasAudience ? 30 : 0);
  
  // Calculate weighted average
  const score = (
    (clarity * 0.25) +
    (specificity * 0.25) +
    (context * 0.2) +
    (structure * 0.15) +
    (completeness * 0.15)
  );
  
  return Math.round(score);
}

/**
 * Analyze a prompt and provide quality feedback
 */
export function analyzePromptQuality(text: string): PromptQualityFeedback {
  const issues = identifyIssues(text);
  const strengths = identifyStrengths(text);
  const score = calculateOverallScore(text);
  const overallFeedback = generateOverallFeedback(score, issues.length);
  
  return {
    score,
    issues,
    strengths,
    overallFeedback
  };
}