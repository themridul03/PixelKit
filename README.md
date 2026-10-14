# PixelKit — All-In-One Image, PDF, Document & AI Tools Platform

> **Tagline:** Every Tool You Need. One Simple Workspace.

PixelKit is a production-grade, privacy-first web application providing high-performance browser-based tools for image editing, conversion, PDF manipulation, and document utilities.

---

## 🚀 Key Architectural Highlights

1. **One Single Codebase:** Built inside a single Next.js project folder and single Git repository.
2. **100% In-Browser Processing:** Image compression, resizing, cropping, watermarking, PDF rendering, merging, splitting, and neural OCR execute directly in client-side memory using HTML5 Canvas, WebAssembly, and Mozilla PDF.js.
3. **Zero Server File Uploads:** Sensitive documents, photographs, IDs, receipts, and scans never leave the user's computer.
4. **Central Tool Registry:** A unified typed tool catalog (`src/config/tools.ts`) driving navigation, search, categorizations, SEO metadata, and sitemaps.
5. **Static Hosting Compatibility:** Fully compatible with Next.js static prerendering, Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

---

## 🛠️ Implemented Tools Overview

### 1. Image Toolkit (`/image-tools`)
- **Image Compressor:** Configurable quality (10–95%), format preservation or conversion (JPG, PNG, WebP), dimension scaling, exact before/after bytes measurement, and multi-file ZIP export.
- **Image Resizer:** Width & height controls in pixels or percentage, aspect ratio locking, and standard presets (Instagram Post, Instagram Story, YouTube Thumbnail, Twitter Header, LinkedIn Banner).
- **Image Cropper:** Interactive canvas crop bounds, fixed aspect ratios (1:1 Square, 4:3, 16:9, 9:16), 90° rotation, and horizontal/vertical flipping.
- **Image Converter:** Conversion between JPG, PNG, WebP, and Base64 Data URL with customizable background fill for transparent images.
- **Passport Photo Maker:** Biometric framing overlay (head and eye line guides), presets for US Passport (2x2 in / 600x600 px), Schengen Visa (35x45 mm), UK, India, and Canada, plus 4x6 inch printable multi-photo sheets with cut lines.
- **Image Watermark:** Text or logo image stamps with position presets (Center, corners, or repeated diagonal tile), opacity, color, and font size controls.
- **Full Image Editor:** Complete canvas studio with brightness, contrast, saturation, blur, grayscale, sepia, invert filters, pen drawing tool, text overlays, and multi-step Undo/Redo.
- **QR Code Generator:** Pure client-side generator for URLs, text, and Wi-Fi networks with foreground/background color customizers and PNG/SVG export.

### 2. PDF Toolkit (`/pdf-tools`)
- **Image to PDF:** Combines JPG, PNG, and WebP images into a single standardized PDF with paper sizing (A4, Letter, A3, fit-to-image), orientation, margins, and page numbers.
- **PDF to Image:** Extracts and renders PDF document pages into high-resolution JPG or PNG images with resolution scale controls (1x to 2x) and ZIP downloads.
- **Merge PDF:** Combines multiple PDF documents in custom user-defined sequence.
- **Split PDF:** Splits all pages into separate single-page documents in a ZIP or extracts specific page ranges (e.g., `1-3, 5, 8-10`).
- **Organize & Rotate PDF:** Visual grid of page thumbnails with 90° individual page rotation, page reordering, and page deletion.
- **PDF Watermark:** Vector-level text watermark overlay (e.g., `CONFIDENTIAL`, `DRAFT`) with angle, opacity, and font size.
- **PDF Viewer & Annotator:** Visual viewer with text overlays, custom note stamps, date markers, and vector PDF export.
- **PDF Compressor:** Stream deduplication and metadata optimization with accurate size reduction reporting.

### 3. AI & Intelligent Utilities (`/ai-tools`)
- **OCR Text Extractor:** Client-side neural optical character recognition using Tesseract.js WebAssembly with live progress reporting, clipboard copy, and `.txt` file export.
- **Document & Text Summarizer:** Deterministic local extractive summarizer with sentence ranking, word frequency analysis, key highlights, and reading metrics.
- **Modular Model Roadmap:** Transparent catalog disclosing local model weights for planned future capabilities.

### 4. Document & Text Utilities (`/document-tools`)
- **Word & Character Counter:** Real-time metrics for words, characters (with/without spaces), sentences, paragraphs, reading time, and speaking time.
- **Text Case Converter:** UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, duplicate line removal, and A-Z sorting.
- **Text Diff Checker:** Visual line-by-line comparison highlighting additions and removals.
- **JSON Formatter & Validator:** 2-space and 4-space indentation, minifier, and syntax validation.

### 5. Design & File Utilities (`/design-tools`, `/file-tools`)
- **Color Converter:** Real-time HEX ↔ RGB ↔ HSL converter with live color preview.
- **CSS Gradient Generator:** Interactive linear gradient builder with angle control and copyable CSS.
- **CSS Box Shadow Generator:** Interactive elevation, blur, spread, and shadow generator.
- **Favicon Package Maker:** Generates 16x16, 32x32, 48x48, 180x180 (Apple Touch Icon), 512x512 icons, plus `site.webmanifest` inside a downloadable ZIP archive.
- **File Hash & Checksum Generator:** SHA-256 and SHA-1 cryptographic file checksum calculator using the native Web Crypto API with verification matching.

---

## 💻 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI & Language:** React 19, TypeScript, Tailwind CSS
- **Icons:** Lucide React
- **PDF Engine:** `pdf-lib`, Mozilla `pdfjs-dist`
- **OCR Engine:** `tesseract.js` (WebAssembly)
- **Archive Generator:** `jszip`
- **Testing:** `vitest`

---

## 🏃 Getting Started

### 1. Installation
Inside the project root:
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view PixelKit in your browser.

### 3. Running Unit Tests
```bash
npm run test
```

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 🛡️ Privacy Guarantee

PixelKit strictly enforces local execution:
- No file uploads or cloud processing.
- No analytics or surveillance tracking on user file data.
- No remote database dependencies.
