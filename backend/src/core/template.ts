import { ExecutionContext } from "../types/dsl.js";
import { resolveFieldPath } from "./evaluator.js";

/**
 * Interpolates runtime variables into a template string using {{step_X.field}} syntax.
 * Example:
 * Template: "🚨 Exam Notice: {{step_2.title}} released! Link: {{step_2.link}}"
 * Replaces tokens with values resolved from execution context.
 */
export function interpolateTemplate(
  template: string,
  context: ExecutionContext
): string {
  const tokenRegex = /\{\{([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\}\}/g;

  return template.replace(tokenRegex, (match, path) => {
    const value = resolveFieldPath(path, context);

    if (value === undefined || value === null) {
      return "[Not Found]";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  });
}
