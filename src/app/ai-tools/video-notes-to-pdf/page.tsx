'use client';

import React, { useState, useRef } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileDropzone, FileItem } from '@/components/upload/FileDropzone';
import { getToolById } from '@/config/tools';
import {
  VideoNoteSnapshot,
  formatVideoTime,
  captureVideoFrame,
  generateVideoNotesPdf
} from '@/lib/ai/videoNotesToPdf';
import { downloadBlob } from '@/lib/utils/download';
import {
  Video,
  Camera,
  Download,
  Trash2,
  Play,
  Clock,
  Sparkles,
  FileCheck,
  Eye,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export default function VideoNotesToPdfPage() {
  const tool = getToolById('video-notes-to-pdf')!;
  const [files, setFiles] = useState<FileItem[]>([]);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('Video Lecture Study Notes');
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('00:00');
  const [currentTimeSecs, setCurrentTimeSecs] = useState(0);

  const [snapshots, setSnapshots] = useState<VideoNoteSnapshot[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedPdf, setGeneratedPdf] = useState<{
    url: string;
    blob: Blob;
    pageCount: number;
    size: number;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFilesChange = (newFiles: FileItem[]) => {
    setFiles(newFiles);
    setSnapshots([]);
    setGeneratedPdf(null);

    if (newFiles.length > 0) {
      const file = newFiles[0].file;
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]+/g, ' ');
      setVideoTitle(rawName);
    } else {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      setVideoSrc(null);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTimeSecs(cur);
      setCurrentTimeFormatted(formatVideoTime(cur));
    }
  };

  const handleCaptureFrame = async () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const { blob, dataUrl } = await captureVideoFrame(video);
      const cur = video.currentTime;

      const newSnapshot: VideoNoteSnapshot = {
        id: Math.random().toString(36).substring(2, 9),
        timestampSeconds: cur,
        timestampFormatted: formatVideoTime(cur),
        imageBlob: blob,
        imageDataUrl: dataUrl,
        noteText: ''
      };

      setSnapshots((prev) => [...prev, newSnapshot]);
    } catch (err: any) {
      console.error('Frame capture failed:', err);
      alert(`Could not capture video frame: ${err.message}`);
    } finally {
      setIsCapturing(false);
    }
  };

  const updateSnapshotNote = (id: string, text: string) => {
    setSnapshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, noteText: text } : s))
    );
  };

  const removeSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSnapshot = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === snapshots.length - 1)
    ) {
      return;
    }
    const newSnapshots = [...snapshots];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSnapshots[index];
    newSnapshots[index] = newSnapshots[targetIndex];
    newSnapshots[targetIndex] = temp;
    setSnapshots(newSnapshots);
  };

  const seekToTimestamp = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleGeneratePdf = async () => {
    if (snapshots.length === 0) {
      alert('Please capture at least one video frame before generating study notes.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateVideoNotesPdf(videoTitle, snapshots);
      const url = URL.createObjectURL(result.blob);
      setGeneratedPdf({
        url,
        blob: result.blob,
        pageCount: result.pageCount,
        size: result.size
      });
    } catch (err: any) {
      console.error('Video notes PDF generation failed:', err);
      alert(`Error generating PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedPdf) return;
    const cleanTitle = (videoTitle || 'lecture_notes').replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadBlob(generatedPdf.blob, `${cleanTitle}_StudyNotes.pdf`);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileDropzone
          acceptedFormats={['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', '.mp4', '.webm', '.mov']}
          maxFileSizeMB={500}
          multiple={false}
          files={files}
          onFilesChange={handleFilesChange}
          title="Upload lecture or tutorial video"
          subtitle="Supports MP4, WebM, and MOV videos up to 500MB (100% local in-browser playback)"
        />

        {videoSrc && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Video Player & Controls */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Study Guide / Lecture Title
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g. CS50 Lecture 3 - Algorithms & Data Structures"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* HTML5 Video Element */}
                <div className="rounded-xl overflow-hidden bg-black aspect-video relative flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Action Bar for Capture */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>Current Time: <strong>{currentTimeFormatted}</strong></span>
                  </div>

                  <button
                    onClick={handleCaptureFrame}
                    disabled={isCapturing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {isCapturing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Snapping Frame...
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        Capture Slide at {currentTimeFormatted}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* PDF Export Banner */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Compile Study Guide PDF
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {snapshots.length} slide{snapshots.length === 1 ? '' : 's'} captured with notes
                  </p>
                </div>

                <button
                  onClick={handleGeneratePdf}
                  disabled={isGenerating || snapshots.length === 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Rendering Study Notes PDF...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      Generate Study Guide PDF
                    </>
                  )}
                </button>
              </div>

              {generatedPdf && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                        Study Guide PDF Generated!
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {generatedPdf.pageCount} page(s) • {(generatedPdf.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm shadow-emerald-600/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Study Guide PDF
                    </button>
                    <a
                      href={generatedPdf.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 Cols: Captured Slide Cards & Notes */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Captured Moments & Notes ({snapshots.length})
                </h3>
                {snapshots.length > 0 && (
                  <button
                    onClick={() => setSnapshots([])}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {snapshots.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                  <Camera className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    No slides or moments captured yet
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Play the video and click <strong>&ldquo;Capture Slide&rdquo;</strong> whenever an important diagram, formula, or slide appears on screen.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {snapshots.map((snap, idx) => (
                    <div
                      key={snap.id}
                      className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => seekToTimestamp(snap.timestampSeconds)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-300 font-mono text-[11px] font-semibold transition-colors"
                            title="Click to jump video to this timestamp"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            {snap.timestampFormatted}
                          </button>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Slide #{idx + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveSnapshot(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                            title="Move up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveSnapshot(idx, 'down')}
                            disabled={idx === snapshots.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-20"
                            title="Move down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeSnapshot(snap.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Image Thumbnail & Note Input */}
                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-black aspect-video flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={snap.imageDataUrl}
                            alt={`Capture at ${snap.timestampFormatted}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="col-span-8">
                          <textarea
                            value={snap.noteText}
                            onChange={(e) => updateSnapshotNote(snap.id, e.target.value)}
                            placeholder="Add study notes, formulas, or key concepts for this slide..."
                            rows={3}
                            className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
