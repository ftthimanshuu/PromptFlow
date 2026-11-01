import { resolveFieldPath } from "./evaluator.js";
/**
 * Formats a runtime value (primitive, array, object) into clean, human-readable text.
 * Prevents raw JSON dumps like ["item 1", "item 2"] in user alerts.
 */
function formatValueForAlert(val) {
    if (val === undefined || val === null) {
        return "[Not Found]";
    }
    // Format Arrays cleanly as bulleted lists
    if (Array.isArray(val)) {
        if (val.length === 0)
            return "[None]";
        const items = val.map((item, idx) => {
            if (typeof item === "object" && item !== null) {
                const inner = Object.entries(item)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" | ");
                return `• ${inner}`;
            }
            return `• ${String(item)}`;
        });
        return "\n" + items.join("\n");
    }
    // Format Objects cleanly as structured key-value lines
    if (typeof val === "object") {
        const entries = Object.entries(val);
        if (entries.length === 0)
            return "[Empty]";
        const lines = entries.map(([k, v]) => `• ${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`);
        return "\n" + lines.join("\n");
    }
    return String(val);
}
/**
 * Interpolates runtime variables into a template string using {{step_X.field}} syntax.
 * Example:
 * Template: "🚨 Exam Notice: {{step_2.title}} released! Link: {{step_2.link}}"
 * Replaces tokens with values resolved from execution context.
 */
export function interpolateTemplate(template, context) {
    const tokenRegex = /\{\{([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\}\}/g;
    return template.replace(tokenRegex, (match, path) => {
        const value = resolveFieldPath(path, context);
        return formatValueForAlert(value);
    });
}
