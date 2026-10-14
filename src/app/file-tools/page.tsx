'use client';

import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import { computeFileHashes, FileHashResult } from '@/lib/document/fileHash';
import { formatBytes } from '@/lib/utils/format';
import { Hash, Copy, Check, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';

export default function FileToolsPage() {
  const tool = getToolById('file-hash')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [hashResult, setHashResult] = useState<FileHashResult | null>(null);
  const [verifyChecksum, setVerifyChecksum] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFilesChange = async (newFiles: FileItem[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      const res = await computeFileHashes(newFiles[0].file);
      setHashResult(res);
    } else {
      setHashResult(null);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isMatching =
    verifyChecksum.trim() &&
    hashResult &&
    (verifyChecksum.trim().toLowerCase() === hashResult.sha256.toLowerCase() ||
      verifyChecksum.trim().toLowerCase() === hashResult.sha1.toLowerCase());

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={[]}
          maxFileSizeMB={200}
          multiple={false}
          files={files}
          onFilesChange={handleFilesChange}
          title="Upload any file to calculate checksum hashes"
          subtitle="Direct client-side streaming via Web Crypto API (up to 200 MB)"
        />

        {hashResult && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <Hash className="w-5 h-5 text-blue-600" />
              <span>Calculated Cryptographic Checksums</span>
            </div>

            <div className="space-y-4">
              {/* SHA-256 */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    SHA-256 (Secure Hash Algorithm 256-bit)
                  </span>
                  <button
                    onClick={() => handleCopy(hashResult.sha256, 'sha256')}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sha256' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all font-semibold">
                  {hashResult.sha256}
                </p>
              </div>

              {/* SHA-1 */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">
                    SHA-1 (Legacy 160-bit Checksum)
                  </span>
                  <button
                    onClick={() => handleCopy(hashResult.sha1, 'sha1')}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'sha1' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sha1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all font-semibold">
                  {hashResult.sha1}
                </p>
              </div>

              {/* Checksum Verifier */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Verify Against Known Checksum
                </label>
                <input
                  type="text"
                  value={verifyChecksum}
                  onChange={(e) => setVerifyChecksum(e.target.value)}
                  placeholder="Paste expected SHA-256 or SHA-1 hash to compare..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-mono"
                />
                {verifyChecksum.trim() && (
                  <div
                    className={`flex items-center gap-2 text-xs font-bold p-2 rounded-lg ${
                      isMatching
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {isMatching ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>MATCH CONFIRMED! The file integrity is intact.</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>CHECKSUM MISMATCH! File may have been modified or corrupted.</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
