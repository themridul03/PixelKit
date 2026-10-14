export interface JsonFormatResult {
  success: boolean;
  formattedText?: string;
  errorMessage?: string;
  errorLine?: number;
}

export function formatJson(input: string, indent: number = 2): JsonFormatResult {
  if (!input.trim()) {
    return { success: false, errorMessage: 'Input is empty' };
  }
  try {
    const parsed = JSON.parse(input);
    return {
      success: true,
      formattedText: JSON.stringify(parsed, null, indent)
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: err.message || 'Invalid JSON syntax'
    };
  }
}

export function minifyJson(input: string): JsonFormatResult {
  if (!input.trim()) {
    return { success: false, errorMessage: 'Input is empty' };
  }
  try {
    const parsed = JSON.parse(input);
    return {
      success: true,
      formattedText: JSON.stringify(parsed)
    };
  } catch (err: any) {
    return {
      success: false,
      errorMessage: err.message || 'Invalid JSON syntax'
    };
  }
}
