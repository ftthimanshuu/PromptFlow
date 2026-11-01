import axios from "axios";
import type {
  PipelineExecutionReport,
  PipelineSpecification,
} from "../types/pipeline";

function getBaseUrl(): string {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  let base = (import.meta.env.VITE_API_URL || "").trim();

  // If running in cloud production and base is empty or points to localhost, route to Render
  if (!base || (!isLocal && base.includes("localhost"))) {
    base = isLocal
      ? "http://localhost:5000/api"
      : "https://promptflow-31p9.onrender.com/api";
  }

  return base.endsWith("/api") ? base : `${base.replace(/\/+$/, "")}/api`;
}

const apiClient = axios.create({
  baseURL: getBaseUrl(),
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
