// 表单校验辅助

export function isNotEmpty(value: string | null | undefined): boolean {
  return !!value && value.trim().length > 0;
}

export function isPositiveNumber(value: unknown): boolean {
  const n = Number(value);
  return !Number.isNaN(n) && n >= 0;
}

export function isRating(value: unknown): boolean {
  const n = Number(value);
  return !Number.isNaN(n) && n >= 1 && n <= 5;
}

export function isYear(value: unknown): boolean {
  const n = Number(value);
  return !Number.isNaN(n) && n >= 1900 && n <= 2100;
}

// 简单校验结果类型
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function mergeErrors(...results: ValidationResult[]): ValidationResult {
  const errors: Record<string, string> = {};
  results.forEach((r) => Object.assign(errors, r.errors));
  return { valid: Object.keys(errors).length === 0, errors };
}
