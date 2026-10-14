export interface TextSummaryResult {
  summary: string;
  keyPoints: string[];
  topKeywords: { word: string; count: number }[];
  originalSentenceCount: number;
  summarySentenceCount: number;
}

const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'that', 'to', 'for',
  'of', 'with', 'as', 'by', 'it', 'this', 'be', 'are', 'from', 'or', 'was', 'were',
  'have', 'has', 'had', 'not', 'but', 'what', 'all', 'can', 'will', 'your', 'we'
]);

export function summarizeTextLocally(
  text: string,
  targetSentencesCount: number = 3
): TextSummaryResult {
  if (!text.trim()) {
    return {
      summary: '',
      keyPoints: [],
      topKeywords: [],
      originalSentenceCount: 0,
      summarySentenceCount: 0
    };
  }

  // 1. Split into sentences
  const rawSentences = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
  const cleanSentences = rawSentences.map((s) => s.trim()).filter((s) => s.length > 15);

  if (cleanSentences.length <= targetSentencesCount) {
    return {
      summary: cleanSentences.join(' '),
      keyPoints: cleanSentences,
      topKeywords: [],
      originalSentenceCount: cleanSentences.length,
      summarySentenceCount: cleanSentences.length
    };
  }

  // 2. Calculate word frequencies
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const freqMap: Record<string, number> = {};
  for (const w of words) {
    freqMap[w] = (freqMap[w] || 0) + 1;
  }

  // 3. Score sentences based on word frequencies and position
  const scored = cleanSentences.map((sentence, idx) => {
    const sWords = sentence.toLowerCase().split(/\s+/);
    let score = 0;
    for (const w of sWords) {
      const cleanW = w.replace(/[^a-z0-9]/g, '');
      if (freqMap[cleanW]) {
        score += freqMap[cleanW];
      }
    }
    // Boost earlier sentences (lead bias in articles)
    if (idx === 0) score *= 1.4;
    else if (idx === 1) score *= 1.2;

    return { sentence, score, originalIndex: idx };
  });

  // 4. Select top sentences
  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, targetSentencesCount);

  // Re-sort selected by original document order for natural reading flow
  selected.sort((a, b) => a.originalIndex - b.originalIndex);

  const topKeywords = Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  return {
    summary: selected.map((s) => s.sentence).join(' '),
    keyPoints: selected.map((s) => s.sentence),
    topKeywords,
    originalSentenceCount: cleanSentences.length,
    summarySentenceCount: selected.length
  };
}
