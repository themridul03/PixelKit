export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

export function toCamelCase(text: string): string {
  return text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

export function toSnakeCase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\W-]+/g, '_');
}

export function toKebabCase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s\W_]+/g, '-');
}

export function removeDuplicateLines(text: string): string {
  const lines = text.split('\n');
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      result.push(line);
    }
  }
  return result.join('\n');
}

export function sortLines(text: string, ascending: boolean = true): string {
  const lines = text.split('\n');
  lines.sort((a, b) => (ascending ? a.localeCompare(b) : b.localeCompare(a)));
  return lines.join('\n');
}
