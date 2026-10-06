/**
 * A deliberately small JSON-Schema subset. One definition serves two jobs:
 * it is sent to the model as the response contract, and it validates whatever comes back.
 * Model output is never trusted until it passes `validate`.
 */
export type Schema =
  | { type: "string"; enum?: readonly string[]; maxLength?: number; minLength?: number; description?: string }
  | { type: "number"; minimum?: number; maximum?: number; description?: string }
  | { type: "boolean"; description?: string }
  | { type: "array"; items: Schema; maxItems?: number; minItems?: number; description?: string }
  | { type: "object"; properties: Readonly<Record<string, Schema>>; required: readonly string[]; description?: string };

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

function check(schema: Schema, value: unknown, path: string): string | null {
  switch (schema.type) {
    case "string": {
      if (typeof value !== "string") return `${path} must be a string`;
      if (schema.enum && !schema.enum.includes(value)) return `${path} is not an allowed value`;
      if (schema.maxLength !== undefined && value.length > schema.maxLength) return `${path} is too long`;
      if (schema.minLength !== undefined && value.trim().length < schema.minLength) return `${path} is too short`;
      return null;
    }
    case "number": {
      if (typeof value !== "number" || !Number.isFinite(value)) return `${path} must be a number`;
      if (schema.minimum !== undefined && value < schema.minimum) return `${path} is too small`;
      if (schema.maximum !== undefined && value > schema.maximum) return `${path} is too large`;
      return null;
    }
    case "boolean":
      return typeof value === "boolean" ? null : `${path} must be true or false`;
    case "array": {
      if (!Array.isArray(value)) return `${path} must be a list`;
      if (schema.maxItems !== undefined && value.length > schema.maxItems) return `${path} has too many items`;
      if (schema.minItems !== undefined && value.length < schema.minItems) return `${path} has too few items`;
      for (let index = 0; index < value.length; index += 1) {
        const error = check(schema.items, value[index], `${path}[${index}]`);
        if (error) return error;
      }
      return null;
    }
    case "object": {
      if (typeof value !== "object" || value === null || Array.isArray(value)) return `${path} must be an object`;
      const record = value as Record<string, unknown>;
      for (const key of Object.keys(record)) {
        if (!(key in schema.properties)) return `${path}.${key} is not expected`;
      }
      for (const key of schema.required) {
        if (!(key in record)) return `${path}.${key} is required`;
      }
      for (const [key, child] of Object.entries(schema.properties)) {
        if (!(key in record)) continue;
        const error = check(child, record[key], `${path}.${key}`);
        if (error) return error;
      }
      return null;
    }
  }
}

export function validate<T>(schema: Schema, value: unknown): ValidationResult<T> {
  const error = check(schema, value, "$");
  return error ? { ok: false, error } : { ok: true, value: value as T };
}

/**
 * The provider-facing version of a schema: strict objects, no length limits
 * (several providers reject them), limits still enforced locally by `validate`.
 */
export function toProviderSchema(schema: Schema): Record<string, unknown> {
  switch (schema.type) {
    case "string":
      return { type: "string", ...(schema.enum ? { enum: schema.enum } : {}), ...(schema.description ? { description: schema.description } : {}) };
    case "number":
      return { type: "number", ...(schema.description ? { description: schema.description } : {}) };
    case "boolean":
      return { type: "boolean" };
    case "array":
      return { type: "array", items: toProviderSchema(schema.items), ...(schema.description ? { description: schema.description } : {}) };
    case "object":
      return {
        type: "object",
        properties: Object.fromEntries(Object.entries(schema.properties).map(([key, child]) => [key, toProviderSchema(child)])),
        // Strict structured output requires every property to be listed as required.
        required: Object.keys(schema.properties),
        additionalProperties: false,
        ...(schema.description ? { description: schema.description } : {}),
      };
  }
}

export const text = (maxLength: number, description?: string): Schema => ({ type: "string", maxLength, description });
export const oneOf = (values: readonly string[], description?: string): Schema => ({ type: "string", enum: values, description });
export const list = (items: Schema, maxItems: number, description?: string): Schema => ({ type: "array", items, maxItems, description });
export const object = (properties: Record<string, Schema>, required: readonly string[] = Object.keys(properties)): Schema => ({
  type: "object",
  properties,
  required,
});
