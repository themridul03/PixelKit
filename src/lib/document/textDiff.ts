export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumberOriginal?: number;
  lineNumberModified?: number;
}

export function computeLineDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');

  const diff: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < origLines.length || j < modLines.length) {
    if (i < origLines.length && j < modLines.length && origLines[i] === modLines[j]) {
      diff.push({
        type: 'unchanged',
        content: origLines[i],
        lineNumberOriginal: i + 1,
        lineNumberModified: j + 1
      });
      i++;
      j++;
    } else if (j < modLines.length && !origLines.includes(modLines[j])) {
      diff.push({
        type: 'added',
        content: modLines[j],
        lineNumberModified: j + 1
      });
      j++;
    } else if (i < origLines.length && !modLines.includes(origLines[i])) {
      diff.push({
        type: 'removed',
        content: origLines[i],
        lineNumberOriginal: i + 1
      });
      i++;
    } else {
      if (i < origLines.length) {
        diff.push({
          type: 'removed',
          content: origLines[i],
          lineNumberOriginal: i + 1
        });
        i++;
      }
      if (j < modLines.length) {
        diff.push({
          type: 'added',
          content: modLines[j],
          lineNumberModified: j + 1
        });
        j++;
      }
    }
  }

  return diff;
}
