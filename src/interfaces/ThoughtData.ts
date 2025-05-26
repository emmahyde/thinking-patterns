export interface ToolRecommendation {
  tool_name: string;
  confidence: number; // 0.0-1.0
  rationale: string;
  priority: number;
  alternative_tools?: string[];
}

export interface StepRecommendation {
  step_description: string;
  recommended_tools: ToolRecommendation[];
  expected_outcome: string;
  next_step_conditions: string[];
}

export interface CurrentStep extends StepRecommendation {
  step_number?: number;
  estimated_duration?: string;
  complexity_level?: 'low' | 'medium' | 'high';
}

export interface EnhancedThoughtData {
  thought: string;
  thought_number: number;
  total_thoughts: number;
  next_thought_needed: boolean;
  is_revision?: boolean;
  revises_thought?: number;
  branch_from_thought?: number;
  branch_id?: string;
  needs_more_thoughts?: boolean;
  current_step?: CurrentStep;
  previous_steps?: StepRecommendation[];
  remaining_steps?: string[];
  tool_usage_history?: {
    tool_name: string;
    used_at: string;
    effectiveness_score?: number;
  }[];
}

export interface ToolContext {
  available_tools: string[];
  user_preferences?: Record<string, any>;
  session_history?: string[];
  problem_domain?: string;
}
