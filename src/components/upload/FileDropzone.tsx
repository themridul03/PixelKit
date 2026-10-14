'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File as FileIcon, X, AlertCircle, Image as ImageIcon, FileText } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';

export interface FileItem {
  id: string;
  file: File;
  previewUrl?: string;
  sizeFormatted: string;
}

interface FileDropzoneProps {
  acceptedFormats?: string[]; // e.g. ['image/jpeg', 'image/png'] or ['.jpg', '.png']
  maxFileSizeMB?: number;
  multiple?: boolean;
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  title?: string;
  subtitle?: string;
}

export function FileDropzone({
  acceptedFormats = [],
  maxFileSizeMB = 50,
  multiple = false,
  files,
  onFilesChange,
  title,
  subtitle
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke preview object URLs when files change or unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    };
  }, []);

  const validateFile = (file: File): string | null => {
    // 1. Check size
    const maxBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File "${file.name}" exceeds maximum allowed size of ${maxFileSizeMB} MB.`;
    }

    // 2. Check format if acceptedFormats are given
    if (acceptedFormats.length > 0) {
      const isAccepted = acceptedFormats.some((fmt) => {
        if (fmt.startsWith('.')) {
          return file.name.toLowerCase().endsWith(fmt.toLowerCase());
        }
        if (fmt.endsWith('/*')) {
          const typePrefix = fmt.replace('/*', '');
          return file.type.startsWith(typePrefix);
        }
        return file.type === fmt;
      });

      if (!isAccepted) {
        return `File type "${file.type || 'unknown'}" is not supported.`;
      }
    }

    return null;
  };

  const processIncomingFiles = (incomingList: FileList | File[]) => {
    setErrorMessage(null);
    const newItems: FileItem[] = [];
    let err: string | null = null;

    const arr = Array.from(incomingList);
    const filesToTake = multiple ? arr : arr.slice(0, 1);

    for (const f of filesToTake) {
      const validationError = validateFile(f);
      if (validationError) {
        err = validationError;
        continue;
      }

      let previewUrl: string | undefined;
      if (f.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(f);
      }

      newItems.push({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        previewUrl,
        sizeFormatted: formatBytes(f.size)
      });
    }

    if (err) {
      setErrorMessage(err);
    }

    if (newItems.length > 0) {
      if (multiple) {
        onFilesChange([...files, ...newItems]);
      } else {
        // Replace existing file if single mode
        files.forEach((old) => {
          if (old.previewUrl) URL.revokeObjectURL(old.previewUrl);
        });
        onFilesChange(newItems);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
    }
    // reset input so user can re-upload same file if removed
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemoveFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = files.find((f) => f.id === id);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    onFilesChange([]);
  };

  const formatSummary = acceptedFormats
    .map((fmt) => fmt.replace('image/', '.').replace('application/', '.'))
    .join(', ');

  return (
    <div className="w-full space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/70'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {title || (multiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle || (formatSummary ? `Supported formats: ${formatSummary}` : 'Select files from your device')}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Max {maxFileSizeMB} MB per file
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              100% In-Browser &amp; Private
            </span>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* File queue previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </span>
            {files.length > 1 && (
              <button
                onClick={handleClearAll}
                className="text-rose-600 dark:text-rose-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {files.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
                  ) : item.file.type === 'application/pdf' ? (
                    <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
                      <FileIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {item.file.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.sizeFormatted}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => handleRemoveFile(item.id, e)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
