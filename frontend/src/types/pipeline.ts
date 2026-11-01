export type StepType = "scrape" | "ai_filter" | "condition" | "notify";

export interface StepDefinition {
  step_id: number;
  type: StepType;
  config: Record<string, any>;
}

export interface PipelineSpecification {
  title: string;
  description?: string;
  schedule_cron: string;
  steps: StepDefinition[];
}

export type StepExecutionStatus = "PENDING" | "RUNNING" | "SUCCESS" | "FAILED" | "SKIPPED";

export interface StepResult {
  step_id: number;
  type: StepType;
  status: StepExecutionStatus;
  output_data?: Record<string, any>;
  error_message?: string;
  duration_ms: number;
}

export interface PipelineExecutionReport {
  automation_id?: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED";
  step_results: StepResult[];
  started_at: string;
  completed_at: string;
  total_duration_ms: number;
  error_message?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  telegram_chat_id?: string | null;
  discord_webhook_url?: string | null;
}

export interface Automation {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  schedule_cron: string;
  steps: StepDefinition[];
  is_active: boolean;
  last_run_at?: string | null;
  created_at: string;
}

