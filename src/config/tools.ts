import { ToolDefinition } from '@/types/tools';

export const TOOLS: ToolDefinition[] = [
  // --- CORE IMAGE TOOLS ---
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    tagline: 'Compress JPG, PNG & WebP without losing visual quality',
    description: 'Reduce image file sizes by up to 90% directly in your browser. Fast, private, and customizable quality control.',
    category: 'image',
    route: '/image-tools/image-compressor',
    iconName: 'FileArchive',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['compress', 'reduce size', 'optimize', 'jpg', 'png', 'webp'],
    features: [
      'Visual quality slider with instant file size comparison',
      'Lossless and lossy compression algorithms',
      'Batch processing with multi-file ZIP download',
      'Zero server upload — 100% private in-browser compression'
    ],
    faqs: [
      {
        question: 'Does compressing my images lower the resolution?',
        answer: 'By default, the pixel dimensions remain exactly the same while redundant metadata and compression entropy are optimized. You can optionally resize dimensions if desired.'
      },
      {
        question: 'Are my images uploaded to any server?',
        answer: 'Never. PixelKit runs the compression engine directly inside your web browser using HTML5 Canvas and Web APIs.'
      }
    ],
    relatedToolIds: ['image-resizer', 'image-converter', 'image-cropper']
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    tagline: 'Resize dimensions in pixels, percentage, or social presets',
    description: 'Change image dimensions with high-quality bicubic downscaling, aspect ratio locking, and preset formats for Instagram, YouTube, and LinkedIn.',
    category: 'image',
    route: '/image-tools/image-resizer',
    iconName: 'Maximize2',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxFileSizeMB: 40,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['resize', 'scale', 'dimensions', 'aspect ratio', 'social media presets'],
    features: [
      'Exact pixel or percentage resizing',
      'Lock or unlock aspect ratio',
      'Social media presets for Instagram, YouTube, LinkedIn, Twitter',
      'High quality image smoothing algorithm'
    ],
    faqs: [
      {
        question: 'How do I keep my image from distorting?',
        answer: 'Keep the aspect ratio lock enabled. Entering a width will automatically calculate the proportional height.'
      }
    ],
    relatedToolIds: ['image-compressor', 'image-cropper', 'passport-photo-maker']
  },
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    tagline: 'Crop images freely or lock to standard aspect ratios',
    description: 'Trim unwanted borders, crop to 1:1 square, 16:9 widescreen, 4:5 portrait, or custom selections with live interactive canvas previews.',
    category: 'image',
    route: '/image-tools/image-cropper',
    iconName: 'Crop',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 40,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['crop', 'cut', 'square', 'trim', 'ratio'],
    features: [
      'Interactive crop bounds selection',
      'Presets: Free, 1:1 Square, 4:3, 16:9, 9:16 Stories',
      'Quick 90° rotation and horizontal/vertical flip',
      'Instant PNG or JPG export'
    ],
    faqs: [
      {
        question: 'Can I crop for Instagram grid posts?',
        answer: 'Yes! Select the 1:1 Square preset or 4:5 Portrait preset for optimal Instagram display.'
      }
    ],
    relatedToolIds: ['image-resizer', 'image-editor', 'passport-photo-maker']
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    tagline: 'Convert between JPG, PNG, WebP, and Base64',
    description: 'Instantly transform image formats with alpha transparency preservation, quality configuration, and batch conversion support.',
    category: 'image',
    route: '/image-tools/image-converter',
    iconName: 'RefreshCw',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/svg+xml'],
    maxFileSizeMB: 50,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['convert', 'jpg to png', 'png to jpg', 'webp', 'base64'],
    features: [
      'Convert between JPG, PNG, WebP, BMP',
      'Export directly to Base64 Data URL for developers',
      'Control background fill when converting transparent PNG to JPG',
      'Batch conversion with zip download'
    ],
    faqs: [
      {
        question: 'What happens to transparency when converting PNG to JPG?',
        answer: 'Because JPEG does not support alpha channels, transparent areas are filled with a clean white background or a custom color of your choice.'
      }
    ],
    relatedToolIds: ['image-compressor', 'image-to-pdf']
  },
  {
    id: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    tagline: 'Create standard biometric passport and visa photos',
    description: 'Crop and resize portrait photos to official passport specifications (US 2x2 in, Schengen 35x45mm, UK, India) and generate printable multi-photo sheets.',
    category: 'image',
    route: '/image-tools/passport-photo-maker',
    iconName: 'UserCheck',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 30,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['passport', 'visa', 'id photo', 'printable sheet', '2x2 photo'],
    features: [
      'Standard presets: US (2x2 in / 600x600px), Schengen/EU (35x45mm), UK, India',
      'Multi-photo printable sheet layout generator (4x6 inch and A4 paper)',
      'Background tinting assistance for clean plain backgrounds',
      'Direct high-resolution print or download'
    ],
    faqs: [
      {
        question: 'Can I print these at a local pharmacy or photo print kiosk?',
        answer: 'Yes! Export the 4x6 inch sheet preset which fits standard photo paper kiosks worldwide.'
      }
    ],
    relatedToolIds: ['image-cropper', 'image-resizer']
  },
  {
    id: 'image-watermark',
    name: 'Image Watermark Tool',
    tagline: 'Stamp custom text or logo watermarks onto your photos',
    description: 'Protect your creative work and branding by overlaying text or logo images with adjustable opacity, size, rotation, and tile patterns.',
    category: 'image',
    route: '/image-tools/image-watermark',
    iconName: 'Stamp',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 40,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: false,
    tags: ['watermark', 'copyright', 'stamp', 'logo overlay', 'protect'],
    features: [
      'Custom text or secondary image logo watermark',
      'Positioning presets: Center, corners, or full repeated diagonal tile',
      'Configurable opacity, font size, and color',
      'Batch watermarking across multiple photos'
    ],
    faqs: [
      {
        question: 'Can watermarks be removed once saved?',
        answer: 'Once exported, the watermark is permanently baked into the image pixels to ensure copyright protection.'
      }
    ],
    relatedToolIds: ['image-editor', 'pdf-watermark']
  },
  {
    id: 'image-editor',
    name: 'Full Image Editor',
    tagline: 'All-in-one studio: filters, adjustments, text, and drawing',
    description: 'Comprehensive browser-based graphic canvas with brightness, contrast, saturation, blur, artistic filters, freehand drawing, shapes, and text layers.',
    category: 'image',
    route: '/image-tools/image-editor',
    iconName: 'Sliders',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['editor', 'filters', 'brightness', 'draw', 'annotate', 'shapes'],
    features: [
      'Color adjustments: Brightness, Contrast, Saturation, Blur, Invert, Grayscale, Sepia',
      'Add editable text captions and shapes (rectangles, circles, arrows)',
      'Pen tool with color and brush size customization',
      'Full Undo/Redo history stack'
    ],
    faqs: [
      {
        question: 'Is there a limit on how many edits I can make?',
        answer: 'No limits. All operations happen in your browser memory with immediate real-time rendering.'
      }
    ],
    relatedToolIds: ['image-cropper', 'image-watermark']
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    tagline: 'Generate high-resolution vector and PNG QR codes',
    description: 'Create customized QR codes for URLs, text, Wi-Fi passwords, and contact cards with custom colors, quiet zones, and instant download.',
    category: 'image',
    route: '/image-tools/qr-code-generator',
    iconName: 'QrCode',
    acceptedFormats: [],
    maxFileSizeMB: 1,
    processingMode: 'deterministic',
    status: 'implemented',
    isPopular: true,
    tags: ['qr code', 'wifi qr', 'barcode', 'svg qr', 'generator'],
    features: [
      'URL, plain text, Wi-Fi network connection, and vCard payloads',
      'Custom foreground and background color styling',
      'Error correction level configuration (L, M, Q, H)',
      'Export in PNG and SVG vector formats'
    ],
    faqs: [
      {
        question: 'Do these QR codes ever expire?',
        answer: 'No. These are static standard QR codes that directly encode the text/URL data and will work forever.'
      }
    ],
    relatedToolIds: ['image-converter']
  },

  // --- CORE PDF TOOLS ---
  {
    id: 'image-to-pdf',
    name: 'Image to PDF Converter',
    tagline: 'Combine single or multiple images into a clean PDF document',
    description: 'Convert JPG, PNG, and WebP images into standardized PDF files with page margins, custom paper sizing (A4, Letter, A3), orientation, and drag-and-drop reordering.',
    category: 'pdf',
    route: '/pdf-tools/image-to-pdf',
    iconName: 'FileImage',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 60,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['image to pdf', 'jpg to pdf', 'png to pdf', 'combine', 'document'],
    features: [
      'Reorder images easily before generating PDF',
      'Page sizes: A4, US Letter, A3, or Fit-to-Image',
      'Portrait and Landscape orientation selection',
      'Custom margin settings (None, Small, Medium, Large)',
      'Optional automatic page numbers'
    ],
    faqs: [
      {
        question: 'Can I add multiple photos into one PDF file?',
        answer: 'Yes! Upload as many images as you need, arrange them in your preferred order, and download a single consolidated PDF.'
      }
    ],
    relatedToolIds: ['merge-pdf', 'pdf-to-image']
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image Converter',
    tagline: 'Render PDF pages into high-resolution JPG or PNG images',
    description: 'Extract every page of a PDF document into individual high-res image files. Preview all pages, choose specific pages, or download all as a ZIP archive.',
    category: 'pdf',
    route: '/pdf-tools/pdf-to-image',
    iconName: 'Image',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['pdf to image', 'pdf to jpg', 'pdf to png', 'extract pages'],
    features: [
      'Render pages using Mozilla PDF.js engine',
      'Export as crisp PNG or compressed JPG',
      'Selectable render scale (1x standard, 2x high resolution)',
      'Individual page download or batch ZIP package'
    ],
    faqs: [
      {
        question: 'Does it work with multi-page PDFs?',
        answer: 'Yes, it renders all pages sequentially with progress tracking and lets you download individual images or all pages packed in a ZIP.'
      }
    ],
    relatedToolIds: ['image-to-pdf', 'pdf-editor']
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    tagline: 'Combine multiple PDF files into one ordered document',
    description: 'Merge separate PDF reports, assignments, or scans into a single organized file with instant drag-and-drop file sorting.',
    category: 'pdf',
    route: '/pdf-tools/merge-pdf',
    iconName: 'Layers',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['merge', 'combine', 'join pdf', 'binder'],
    features: [
      'Upload multiple PDF files simultaneously',
      'Drag and drop to reorder document sequence',
      'Preserve document links, bookmarks, and vector quality',
      'Fast client-side assembly using pdf-lib'
    ],
    faqs: [
      {
        question: 'Is there a limit on how many files I can merge?',
        answer: 'You can merge dozens of files as memory permits in your browser without any server bottlenecks.'
      }
    ],
    relatedToolIds: ['split-pdf', 'organize-pdf']
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    tagline: 'Separate pages or extract custom page ranges',
    description: 'Extract specific pages, page ranges (e.g. 1-3, 5, 8-10), or split an entire PDF into individual single-page documents.',
    category: 'pdf',
    route: '/pdf-tools/split-pdf',
    iconName: 'Scissors',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 80,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['split', 'extract pages', 'separate', 'cut pdf'],
    features: [
      'Custom range syntax (e.g. "1-4, 7, 9-12")',
      'Split all pages into separate files packed into a ZIP',
      'Instant page count and preview',
      'Lossless vector quality preservation'
    ],
    faqs: [
      {
        question: 'Can I extract just one page from a 100-page document?',
        answer: 'Yes! Simply enter the page number (e.g. "42") and PixelKit will produce a clean 1-page PDF.'
      }
    ],
    relatedToolIds: ['merge-pdf', 'organize-pdf']
  },
  {
    id: 'organize-pdf',
    name: 'Organize & Rotate PDF',
    tagline: 'Reorder, rotate, and delete individual PDF pages',
    description: 'Interactive visual grid of every page in your document. Rotate crooked pages by 90°, delete unwanted pages, and reorder pages effortlessly.',
    category: 'pdf',
    route: '/pdf-tools/organize-pdf',
    iconName: 'Grid',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 80,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['organize', 'rotate pdf', 'delete pages', 'reorder pages'],
    features: [
      'Visual thumbnail grid of all document pages',
      'Rotate individual pages or all pages simultaneously',
      'Delete unneeded pages with one click',
      'Move pages earlier or later in the document'
    ],
    faqs: [
      {
        question: 'Can I rotate just upside-down pages?',
        answer: 'Yes, each page has independent 90° rotation controls so you can fix only the pages that require adjustment.'
      }
    ],
    relatedToolIds: ['split-pdf', 'merge-pdf']
  },
  {
    id: 'pdf-watermark',
    name: 'PDF Watermark',
    tagline: 'Add text watermarks to all or selected PDF pages',
    description: 'Overlay confidential stamps, draft notices, or copyright marks across PDF pages with angle, opacity, font size, and color controls.',
    category: 'pdf',
    route: '/pdf-tools/pdf-watermark',
    iconName: 'FileCheck',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 80,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: false,
    tags: ['watermark pdf', 'confidential stamp', 'draft', 'protect pdf'],
    features: [
      'Custom watermark text (e.g. CONFIDENTIAL, DRAFT, COPY)',
      'Diagonal 45° angle or horizontal orientation',
      'Adjustable opacity and font size',
      'Applied across all pages cleanly via vector primitives'
    ],
    faqs: [
      {
        question: 'Will adding a watermark make the text unreadable?',
        answer: 'You can adjust the opacity slider (e.g., 20-30%) so the underlying document text remains fully legible.'
      }
    ],
    relatedToolIds: ['image-watermark', 'pdf-editor']
  },
  {
    id: 'pdf-editor',
    name: 'PDF Viewer & Annotator',
    tagline: 'View, annotate, highlight, and sign PDF documents',
    description: 'Interactive PDF workspace. Add text overlays, highlights, drawings, date stamps, and signature images directly onto any page and export.',
    category: 'pdf',
    route: '/pdf-tools/pdf-editor',
    iconName: 'Edit3',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 80,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['pdf editor', 'annotate', 'signature', 'highlight', 'sign pdf'],
    features: [
      'Page navigation with zoom in/out and fit-to-width controls',
      'Add custom text notes and dates anywhere on the page',
      'Draw freehand signatures or annotations',
      'Permanent vector-level export preserving all annotations'
    ],
    faqs: [
      {
        question: 'Does this modify existing text in the PDF?',
        answer: 'As clearly outlined, browser-based PDF editors add new annotation, text, and signature layers over the document. True editing of arbitrary font streams is fundamentally limited in client-side engines.'
      }
    ],
    relatedToolIds: ['organize-pdf', 'pdf-to-image']
  },
  {
    id: 'compress-pdf',
    name: 'PDF Compressor',
    tagline: 'Optimize PDF file structures and remove redundant data',
    description: 'Optimize PDF files by stripping unnecessary metadata, deduplicating objects, and restructuring content streams to reduce file size without corruption.',
    category: 'pdf',
    route: '/pdf-tools/compress-pdf',
    iconName: 'Minimize2',
    acceptedFormats: ['application/pdf'],
    maxFileSizeMB: 100,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: true,
    tags: ['compress pdf', 'reduce pdf size', 'optimize pdf', 'shrink pdf'],
    features: [
      'Accurate before/after file size measurement',
      'Strips bloated metadata and dead object references',
      'Preserves original vector text and font definitions',
      'Honest reporting: explains when a PDF is already fully compressed'
    ],
    faqs: [
      {
        question: 'Why do some PDFs not shrink significantly?',
        answer: 'Many modern PDFs already have maximally compressed JPEG/Flate streams. PixelKit avoids aggressive down-rasterization so your document stays sharp and searchable.'
      }
    ],
    relatedToolIds: ['image-compressor', 'split-pdf']
  },

  // --- AI & INTELLIGENT TOOLS ---
  {
    id: 'ocr',
    name: 'OCR & Text Extractor',
    tagline: 'Extract editable text from scanned documents and images',
    description: 'Turn photos of documents, receipts, screenshots, and book pages into editable text using client-side Tesseract.js neural OCR engine.',
    category: 'ai',
    route: '/ai-tools/ocr',
    iconName: 'ScanText',
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'],
    maxFileSizeMB: 30,
    processingMode: 'browser-ai',
    status: 'implemented',
    isPopular: true,
    tags: ['ocr', 'text extraction', 'tesseract', 'image to text', 'scan to text'],
    features: [
      'Runs entirely on client WebAssembly / Web Workers',
      'Confidence scoring and real-time recognition progress',
      'Copy text to clipboard with one click',
      'Export recognized text as a .TXT file'
    ],
    faqs: [
      {
        question: 'Are my scanned documents sent to an external AI server?',
        answer: 'No. The Tesseract.js WebAssembly model executes inside your browser, ensuring complete privacy for sensitive receipts or invoices.'
      }
    ],
    relatedToolIds: ['pdf-summarizer', 'image-to-pdf']
  },
  {
    id: 'pdf-summarizer',
    name: 'Document & Text Summarizer',
    tagline: 'Extract key takeaways and sentence rankings locally',
    description: 'Fast local extractive text analysis. Computes word frequencies, sentence importance scores, key takeaways, and word/reading statistics.',
    category: 'ai',
    route: '/ai-tools/pdf-summarizer',
    iconName: 'Sparkles',
    acceptedFormats: ['text/plain', 'application/json'],
    maxFileSizeMB: 10,
    processingMode: 'deterministic',
    status: 'implemented',
    isPopular: false,
    tags: ['summarize', 'key takeaways', 'text analysis', 'reading time'],
    features: [
      'Local deterministic sentence ranking algorithm',
      'Configurable summary length (Short, Medium, Comprehensive)',
      'Key vocabulary and high-frequency terms extraction',
      'Word count, character count, and estimated reading time'
    ],
    faqs: [
      {
        question: 'Does this use an external paid LLM?',
        answer: 'No! It utilizes local statistical heuristics and natural language term extraction, guaranteeing instantaneous results with zero token costs or privacy leaks.'
      }
    ],
    relatedToolIds: ['ocr', 'document-tools']
  },

  // --- DOCUMENT TOOLS ---
  {
    id: 'document-tools',
    name: 'Document & Text Utilities',
    tagline: 'Word counter, text diff checker, case converter & JSON formatter',
    description: 'A complete suite of text and document utilities: Word and character counter, text diff comparison, case conversions, JSON validator/formatter, and Markdown previewer.',
    category: 'document',
    route: '/document-tools',
    iconName: 'FileText',
    acceptedFormats: [],
    maxFileSizeMB: 10,
    processingMode: 'deterministic',
    status: 'implemented',
    isPopular: true,
    tags: ['word counter', 'case converter', 'diff checker', 'json formatter', 'markdown'],
    features: [
      'Word, character, sentence, and paragraph counter with reading metrics',
      'Text Case Converter: UPPER, lower, Title Case, camelCase, snake_case',
      'Visual side-by-side text difference checker',
      'JSON formatter, validator, and syntax minifier',
      'Markdown to HTML live dual-pane editor'
    ],
    faqs: [
      {
        question: 'Are my texts stored anywhere?',
        answer: 'No data is stored or transmitted. Everything runs inside browser state.'
      }
    ],
    relatedToolIds: ['file-hash', 'pdf-summarizer']
  },

  // --- DESIGN & FILE TOOLS ---
  {
    id: 'design-tools',
    name: 'Design & CSS Generator Suite',
    tagline: 'Color picker, gradient builder, box-shadow & favicon maker',
    description: 'Essential web designer utilities: HEX/RGB/HSL converter, interactive CSS gradient generator, multi-layer box shadow creator, and multi-size favicon package maker.',
    category: 'design',
    route: '/design-tools',
    iconName: 'Palette',
    acceptedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    maxFileSizeMB: 10,
    processingMode: 'deterministic',
    status: 'implemented',
    isPopular: true,
    tags: ['color picker', 'gradient generator', 'css shadow', 'favicon', 'css border radius'],
    features: [
      'Interactive CSS Gradient Generator with copyable CSS code',
      'CSS Box Shadow visual tuning with live cards',
      'HEX, RGB, HSL, and CMYK instant conversion',
      'Multi-size Favicon generator (16, 32, 48, 180, 512px) in downloadable ZIP'
    ],
    faqs: [
      {
        question: 'Can I copy the generated CSS directly into Tailwind or CSS files?',
        answer: 'Yes! All CSS generators provide one-click code copy ready for modern web development.'
      }
    ],
    relatedToolIds: ['qr-code-generator', 'image-editor']
  },
  {
    id: 'file-hash',
    name: 'File Hash & Checksum Generator',
    tagline: 'Calculate SHA-256, SHA-1, and verify file integrity',
    description: 'Generate cryptographic file checksums using the native Web Crypto API. Verify file authenticity, detect file tampering, and inspect exact byte counts.',
    category: 'file',
    route: '/file-tools',
    iconName: 'Hash',
    acceptedFormats: [],
    maxFileSizeMB: 200,
    processingMode: 'browser',
    status: 'implemented',
    isPopular: false,
    tags: ['hash', 'sha256', 'sha1', 'checksum', 'file integrity'],
    features: [
      'Cryptographically secure SHA-256 and SHA-1 calculation',
      'Direct client-side streaming via Web Crypto API',
      'Side-by-side hash comparison to verify matching files',
      'Detailed MIME type and file byte inspection'
    ],
    faqs: [
      {
        question: 'Can I compute the checksum of large files?',
        answer: 'Yes, because Web Crypto processes file array buffers without uploading them, it works smoothly on large documents.'
      }
    ],
    relatedToolIds: ['document-tools']
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Tools', description: 'Explore all available image, PDF, and utility tools' },
  { id: 'image', name: 'Image Tools', description: 'Compress, resize, crop, convert, and edit images' },
  { id: 'pdf', name: 'PDF Tools', description: 'Merge, split, organize, convert, and annotate PDF documents' },
  { id: 'ai', name: 'AI & Smart Tools', description: 'Client-side OCR and intelligent text analysis' },
  { id: 'document', name: 'Document Tools', description: 'Word counter, text diff, JSON formatter, and converters' },
  { id: 'design', name: 'Design Tools', description: 'Color converters, CSS generators, and favicon makers' },
  { id: 'file', name: 'File Utilities', description: 'File hashes, checksums, and metadata inspection' }
] as const;

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  if (category === 'all') return TOOLS;
  return TOOLS.filter((tool) => tool.category === category);
}

export function getPopularTools(): ToolDefinition[] {
  return TOOLS.filter((tool) => tool.isPopular);
}

export function searchTools(query: string): ToolDefinition[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return TOOLS.filter((tool) => {
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.tagline.toLowerCase().includes(q) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}
