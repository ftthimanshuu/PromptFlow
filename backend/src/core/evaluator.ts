import { ConditionConfig, ExecutionContext } from "../types/dsl.js";

/**
 * Resolves dot-notation path like "step_2.price" from execution context
 */
export function resolveFieldPath(path: string, context: ExecutionContext): unknown {
  const parts = path.split(".");
  let current: any = context;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

export interface EvaluationResult {
  passed: boolean;
  actual_value: unknown;
  expected_value: unknown;
  field: string;
  operator: string;
  reason?: string;
}

/**
 * Extracts a numeric value from numbers or currency-formatted strings (e.g. "£51.77" -> 51.77, "₹45,000" -> 45000)
 */
function parseNumeric(val: unknown): number {
  if (typeof val === "number") return val;
  if (val === null || val === undefined) return NaN;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]+/g, "");
    return parseFloat(cleaned);
  }
  return Number(val);
}

/**
 * Deterministically evaluates a condition config against the current execution context.
 */
export function evaluateCondition(
  config: ConditionConfig,
  context: ExecutionContext
): EvaluationResult {
  const actualValue = resolveFieldPath(config.field, context);
  const expectedValue = config.value;
  const operator = config.operator;

  let passed = false;

  if (actualValue === undefined || actualValue === null) {
    return {
      passed: false,
      actual_value: actualValue,
      expected_value: expectedValue,
      field: config.field,
      operator,
      reason: `Field "${config.field}" could not be resolved from prior step execution outputs.`,
    };
  }

  switch (operator) {
    case "==":
      // Loosely handle boolean/string conversions (e.g. "true" == true)
      if (typeof expectedValue === "boolean") {
        passed = String(actualValue).toLowerCase() === String(expectedValue).toLowerCase();
      } else if (typeof expectedValue === "number") {
        passed = parseNumeric(actualValue) === expectedValue;
      } else {
        passed = String(actualValue).trim().toLowerCase() === String(expectedValue).trim().toLowerCase();
      }
      break;

    case "!=":
      if (typeof expectedValue === "boolean") {
        passed = String(actualValue).toLowerCase() !== String(expectedValue).toLowerCase();
      } else if (typeof expectedValue === "number") {
        passed = parseNumeric(actualValue) !== expectedValue;
      } else {
        passed = String(actualValue).trim().toLowerCase() !== String(expectedValue).trim().toLowerCase();
      }
      break;

    case ">":
      passed = parseNumeric(actualValue) > parseNumeric(expectedValue);
      break;

    case "<":
      passed = parseNumeric(actualValue) < parseNumeric(expectedValue);
      break;

    case ">=":
      passed = parseNumeric(actualValue) >= parseNumeric(expectedValue);
      break;

    case "<=":
      passed = parseNumeric(actualValue) <= parseNumeric(expectedValue);
      break;

    case "contains":
      passed = String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      break;

    default:
      passed = false;
  }

  return {
    passed,
    actual_value: actualValue,
    expected_value: expectedValue,
    field: config.field,
    operator,
  };
}

