import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
}

export async function recognizeImageText(
  file: File | Blob,
  language: string = 'eng',
  onProgress?: (progress: number, status: string) => void
): Promise<OcrResult> {
  const worker = await createWorker(language, undefined, {
    logger: (m) => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress(Math.round((m.progress || 0) * 100), m.status);
      }
    }
  });

  try {
    const ret = await worker.recognize(file);
    return {
      text: ret.data.text,
      confidence: Math.round(ret.data.confidence)
    };
  } finally {
    await worker.terminate();
  }
}
