import axios from "axios";
import type {
  PipelineExecutionReport,
  PipelineSpecification,
} from "../types/pipeline";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase.replace(/\/+$/, "")}/api`;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 45000, // 45s for LLM & scraping operations
});

export interface CompileApiResponse {
  status: "complete" | "incomplete";
  question?: string;
  pipeline?: PipelineSpecification;
}

export const api = {
  async compilePrompt(
    prompt: string,
    sessionId?: string,
    userId?: string
  ): Promise<CompileApiResponse> {
    const response = await apiClient.post<CompileApiResponse>("/compile", {
      prompt,
      session_id: sessionId,
      user_id: userId,
    });
    return response.data;
  },

  async executeTestRun(
    pipeline: PipelineSpecification,
    userDestinations?: {
      telegram_chat_id?: string | null;
      discord_webhook_url?: string | null;
    }
  ): Promise<PipelineExecutionReport> {
    const response = await apiClient.post<PipelineExecutionReport>("/execute/test", {
      pipeline,
      user_destinations: userDestinations,
    });
    return response.data;
  },

  async createAutomation(
    userId: string,
    pipeline: PipelineSpecification,
    isActive: boolean = true
  ) {
    const response = await apiClient.post("/automations", {
      user_id: userId,
      pipeline,
      is_active: isActive,
    });
    return response.data;
  },

  async toggleAutomation(id: string, isActive: boolean) {
    const response = await apiClient.patch(`/automations/${id}/toggle`, {
      is_active: isActive,
    });
    return response.data;
  },

  async deleteAutomation(id: string) {
    const response = await apiClient.delete(`/automations/${id}`);
    return response.data;
  },

  async checkHealth() {
    const response = await apiClient.get("/health");
    return response.data;
  },
};
