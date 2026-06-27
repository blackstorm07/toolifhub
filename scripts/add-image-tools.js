/**
 * Adds the new Image Tools batch to an EXISTING database without touching
 * anything else — unlike scripts/seed.js, this does not delete any data.
 * Safe to re-run: tools that already exist (matched by slug) are skipped.
 *
 * Run with: node scripts/add-image-tools.js
 * Requires .env to be configured with MONGODB_URI.
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'toolifhub';

if (!MONGODB_URI) { console.error('❌ MONGODB_URI is not set in .env'); process.exit(1); }

const CategorySchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, icon: String,
  description: String, featured: Boolean, order: Number,
}, { timestamps: true });

const ToolSchema = new mongoose.Schema({
  title: String, slug: { type: String, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  shortDescription: String, fullDescription: String, keywords: [String],
  icon: String, featured: Boolean, trending: Boolean,
  status: { type: String, enum: ['active', 'inactive', 'coming-soon'], default: 'active' },
  visibility: { type: String, enum: ['worldwide', 'india_only'], default: 'worldwide' },
  faq: [{ question: String, answer: String }],
  relatedTools: [String],
  seoTitle: String, seoDescription: String, seoKeywords: [String],
  seoContent: {
    type: {
      overview: String,
      features: [String],
      benefits: [String],
      howToUse: [String],
      useCases: [{ title: String, description: String }],
    },
    default: null,
  },
  views: { type: Number, default: 0 }, usageCount: { type: Number, default: 0 },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Tool = mongoose.models.Tool || mongoose.model('Tool', ToolSchema);

// Keep this list in sync with TOOLS_BY_CATEGORY['image-tools'] in scripts/seed.js
const IMAGE_TOOLS = [

    {
      title: 'Image Compressor', slug: 'image-compressor', icon: '🗜️',
      shortDescription: 'Compress JPG, PNG, and WebP images to reduce file size without losing visible quality.',
      fullDescription: 'Drag and drop one or more JPG, PNG, or WebP images and compress them right in your browser. Adjust the quality slider to balance file size against visual fidelity, watch live before/after size comparisons with percentage savings for every file, and download each compressed image individually or all at once. Nothing is uploaded to a server — all compression runs locally using efficient browser-based image processing.',
      keywords: ['image compressor', 'compress image', 'reduce image size', 'jpg compressor', 'png compressor', 'webp compressor', 'shrink image file size'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'Does compressing an image reduce its dimensions?', answer: 'No. The Image Compressor keeps width and height the same — it only reduces file size by optimizing pixel data and re-encoding at the quality level you choose. Use the Image Resizer if you also want to change dimensions.' },
        { question: 'Will my images be uploaded to a server?', answer: 'No. Every compression operation runs entirely inside your browser using JavaScript. Your images never leave your device, which means there is no upload wait time and no privacy concern.' },
        { question: 'What quality setting should I use?', answer: 'For photos shared on the web, 70-85% quality usually gives a strong balance between visible quality and file size. For thumbnails or background images where detail matters less, you can go as low as 40-60%.' },
        { question: 'Can I compress multiple images at once?', answer: 'Yes. Drag and drop or select multiple files and they will all be queued and compressed using the same quality setting. Each file gets its own progress indicator and download button.' },
        { question: 'Which file formats are supported?', answer: 'JPG, PNG, and WebP images are all supported as input. The compressor preserves the original format while reducing file size.' },
        { question: 'Why didn\'t my PNG shrink as much as my JPG?', answer: 'PNG is a lossless format, so compression gains mostly come from re-encoding and color optimization rather than quality reduction. JPG and WebP support true lossy compression, so they typically see larger size reductions.' },
        { question: 'Is there a file size or count limit?', answer: 'There\'s no hard limit enforced by the tool, but very large images or large batches may take longer to process since everything runs on your device\'s CPU.' },
        { question: 'Can I download all compressed images in one click?', answer: 'Yes, once your files are compressed, use the "Download All" button to save them sequentially without having to click each one individually.' },
      ],
      relatedTools: ['png-to-jpg', 'jpg-to-png', 'image-optimizer', 'image-resizer'],
      seoTitle: 'Image Compressor — Compress JPG, PNG & WebP Online Free | ToolifHub',
      seoDescription: 'Compress JPG, PNG, and WebP images online for free. Reduce file size with a quality slider, live before/after comparison, and batch download — all in your browser.',
      seoContent: {
        overview: 'Large image files slow down websites, fill up storage, and make emails and uploads frustrating. The Image Compressor solves this by shrinking JPG, PNG, and WebP files directly in your browser, with no software to install and no files ever leaving your device. Whether you\'re preparing product photos for an online store, optimizing a blog\'s hero images, or just trying to fit a photo under an upload size limit, this tool gives you precise control over the size-versus-quality tradeoff.\n\nUnlike many online compressors that route your images through a remote server (introducing upload time and privacy concerns), this tool uses client-side JavaScript compression so processing starts instantly and your photos are never transmitted anywhere. You can compress one image or an entire batch in a single pass, watching real-time progress and the resulting size reduction for each file.\n\nThe quality slider gives you fine-grained control: drag it down for maximum savings when quality is less critical, or keep it high when you need the image to look crisp on a high-resolution display. A live before/after size comparison with a percentage-reduction badge makes it easy to see exactly how much space you\'re saving before you commit to downloading.\n\nBecause everything happens locally, there\'s no daily usage cap, no watermarking, and no account required. It is built to be the fastest way to get web-ready images without a round trip to a desktop editor.',
        features: [
          'Drag-and-drop or click-to-browse upload supporting JPG, PNG, and WebP',
          'Batch processing of multiple images in a single session',
          'Adjustable quality slider from 10% to 100%',
          'Live before/after file size comparison with percentage reduction badges',
          'Per-file progress indicators during compression',
          'Individual download buttons plus a one-click "Download All"',
          'Thumbnail previews so you can confirm which file is which',
          '100% client-side processing — no uploads, no server round trip',
        ],
        benefits: [
          'Faster website load times from smaller image payloads',
          'Easily meet email attachment or upload size limits',
          'Save storage space across devices and cloud drives',
          'No privacy risk since images never leave your browser',
          'No software installation or account sign-up required',
        ],
        howToUse: [
          'Drag your image(s) into the upload area, or click to browse and select files',
          'Adjust the compression quality slider to your desired balance of size and clarity',
          'Watch each file compress with a live progress bar and resulting size shown',
          'Review the before/after size and percentage reduction for every image',
          'Download files individually, or click "Download All" to save the whole batch',
        ],
        useCases: [
          { title: 'E-commerce product photos', description: 'Shrink high-resolution product shots so store pages load quickly without sacrificing visible detail.' },
          { title: 'Blog and content images', description: 'Compress hero images and inline screenshots to improve Core Web Vitals and page speed scores.' },
          { title: 'Email attachments', description: 'Reduce photo sizes so they fit within email provider attachment limits.' },
          { title: 'Portfolio and gallery uploads', description: 'Prepare batches of photos for faster uploads to portfolio sites or social platforms.' },
        ],
      },
    },
    {
      title: 'PNG to JPG Converter', slug: 'png-to-jpg', icon: '🔄',
      shortDescription: 'Convert PNG images to JPG format with a custom background color for transparency.',
      fullDescription: 'Convert PNG files to JPG directly in your browser. Since JPG doesn\'t support transparency, choose a background color to fill any transparent areas before conversion, adjust the output quality, and convert multiple files at once with instant previews and downloads.',
      keywords: ['png to jpg', 'png to jpg converter', 'convert png to jpeg', 'png to jpeg online', 'image format converter'],
      featured: true, trending: false, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'What happens to transparent areas when converting PNG to JPG?', answer: 'JPG does not support transparency, so any transparent pixels in your PNG are filled with the background color you choose before conversion — white by default, but you can pick any color.' },
        { question: 'Will converting to JPG reduce image quality?', answer: 'JPG uses lossy compression, so there can be a small quality loss, especially at lower quality settings. Using a quality setting of 85% or higher typically preserves visual quality very well.' },
        { question: 'Can I convert multiple PNG files at once?', answer: 'Yes, you can drag and drop multiple PNG files and they\'ll all be converted using the same quality and background color settings, with individual download buttons.' },
        { question: 'Why would I convert PNG to JPG?', answer: 'JPG files are usually much smaller than PNG for photographic images, making them better for web pages, email attachments, and storage efficiency when transparency isn\'t needed.' },
        { question: 'Does this tool change the image resolution?', answer: 'No, the output JPG keeps the same pixel dimensions as your original PNG. Use the Image Resizer separately if you also want to change dimensions.' },
        { question: 'Can I pick any background color?', answer: 'Yes, use the color picker to choose any solid background color to fill transparent regions, not just white.' },
        { question: 'Is my image uploaded anywhere during conversion?', answer: 'No. Conversion happens entirely in your browser using the HTML canvas API — your files are never sent to a server.' },
        { question: 'What quality setting is recommended?', answer: 'For most photos, 80-95% quality gives excellent results with reasonable file size. Lower settings save more space but can introduce visible compression artifacts.' },
      ],
      relatedTools: ['jpg-to-png', 'webp-converter', 'image-compressor'],
      seoTitle: 'PNG to JPG Converter — Free Online Image Converter | ToolifHub',
      seoDescription: 'Convert PNG to JPG online for free. Choose a background color for transparency, adjust quality, and batch convert — all processed locally in your browser.',
      seoContent: {
        overview: 'PNG is great for graphics with transparency and sharp edges, but it often produces larger files than necessary for photographic content, and many platforms or print workflows specifically require JPG. The PNG to JPG Converter handles this transition cleanly, drawing your PNG onto a canvas with a background color of your choice to correctly handle any transparent pixels before re-encoding as a JPG.\n\nBecause JPG has no concept of an alpha channel, simply changing a file extension from .png to .jpg would corrupt transparent areas or fail outright. This tool does the conversion properly: it paints a solid background behind your image first, ensuring transparent regions become a clean, intentional color rather than black or a strange artifact.\n\nYou get full control over both the background color (via a standard color picker, defaulting to white) and the JPG output quality, so you can fine-tune the result for your specific use case — whether that\'s minimizing file size for a web upload or preserving maximum fidelity for print.\n\nThe tool supports converting several PNGs in one batch, each with live thumbnail previews, so you can visually confirm the conversion before downloading. All processing happens locally via your browser\'s canvas API, meaning conversions are instant and your images are never transmitted to any server.',
        features: [
          'Batch PNG to JPG conversion with thumbnail previews',
          'Customizable background color picker for transparent areas',
          'Adjustable JPG output quality slider',
          'Canvas-based conversion that preserves original resolution',
          'Individual and bulk download options',
          'Instant client-side processing with no file uploads',
          'Visual before/after preview of the converted file',
        ],
        benefits: [
          'Smaller file sizes for photographic PNG images',
          'Compatibility with platforms that require JPG format',
          'Full control over how transparency is handled',
          'No quality surprises thanks to a live quality slider',
          'Completely private — no server uploads involved',
        ],
        howToUse: [
          'Drag and drop your PNG file(s) into the upload zone',
          'Pick a background color to replace any transparent pixels',
          'Adjust the JPG quality slider to your preference',
          'Review the converted preview and resulting file size',
          'Download the converted JPG file or all files at once',
        ],
        useCases: [
          { title: 'Removing transparency for legacy systems', description: 'Convert transparent PNG logos or graphics into JPGs for platforms that don\'t support alpha channels.' },
          { title: 'Reducing storage for photo PNGs', description: 'Shrink photographic PNG screenshots into much smaller JPGs without significant visible quality loss.' },
          { title: 'Print and document preparation', description: 'Convert PNG assets to JPG when a print workflow or document template requires that format.' },
          { title: 'Email and upload compatibility', description: 'Convert to JPG when a form, CMS, or email client only accepts JPG image uploads.' },
        ],
      },
    },
    {
      title: 'JPG to PNG Converter', slug: 'jpg-to-png', icon: '🔁',
      shortDescription: 'Convert JPG/JPEG images to lossless PNG format while preserving resolution.',
      fullDescription: 'Convert JPG or JPEG images to PNG format directly in your browser. The conversion preserves the original resolution and produces a lossless PNG output, ideal for further editing or when you need an image format that supports transparency for future edits.',
      keywords: ['jpg to png', 'jpeg to png converter', 'convert jpg to png online', 'jpg to png free', 'image converter'],
      featured: false, trending: false, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'Will converting JPG to PNG improve image quality?', answer: 'No. PNG is lossless going forward, but it cannot restore detail already lost during the original JPG compression. The conversion simply re-encodes the existing pixel data without further lossy compression.' },
        { question: 'Why convert JPG to PNG at all?', answer: 'PNG is useful when you need a format that supports transparency for future edits, want lossless re-saving during an editing workflow, or need compatibility with tools that require PNG input.' },
        { question: 'Will the output PNG have a transparent background?', answer: 'No. JPG images don\'t have transparency information, so the converted PNG will have the same fully opaque background as the original JPG.' },
        { question: 'Does this tool resize my image?', answer: 'No, the converter preserves the exact original pixel dimensions of your JPG. Use the Image Resizer if you also need to change the size.' },
        { question: 'Can I convert several JPGs in one batch?', answer: 'Yes, drag and drop multiple JPG files and each will be converted to PNG independently with its own preview and download button.' },
        { question: 'Will the PNG file be larger than the original JPG?', answer: 'Usually yes, since PNG is lossless and JPG uses lossy compression. Expect the PNG file size to be noticeably larger, especially for photographic images.' },
        { question: 'Is this conversion done on a server?', answer: 'No, everything happens locally in your browser using the canvas API, so your images are never uploaded anywhere.' },
        { question: 'What image formats can I upload?', answer: 'This tool accepts standard JPG and JPEG files as input and always outputs PNG.' },
      ],
      relatedTools: ['png-to-jpg', 'webp-converter', 'image-compressor'],
      seoTitle: 'JPG to PNG Converter — Free Online Lossless Converter | ToolifHub',
      seoDescription: 'Convert JPG or JPEG images to PNG for free, preserving resolution with lossless output. Fast, private, browser-based conversion with no uploads.',
      seoContent: {
        overview: 'While JPG is excellent for compact photo storage, certain workflows call for PNG instead — particularly when you need a lossless format for further editing, or compatibility with software and design tools that expect PNG input. The JPG to PNG Converter performs this transformation entirely within your browser, drawing the original JPG onto a canvas and exporting it as a PNG without any additional lossy re-compression.\n\nThe output preserves your image\'s exact resolution, so nothing is upscaled, downscaled, or cropped during conversion. This makes the tool a reliable first step before further image editing, layering, or annotation work where a lossless intermediate format is preferred.\n\nBatch support means you can convert several JPG files in one pass, each with a live thumbnail so you can verify the right files were selected. As with all the tools in this suite, conversion happens locally in your browser using the HTML canvas API — no images are ever uploaded to a remote server, keeping your files completely private.\n\nKeep in mind that converting from JPG to PNG cannot recover detail already lost to JPG\'s lossy compression; it simply stops further lossy re-encoding going forward and gives you a format more suitable for subsequent editing steps.',
        features: [
          'Batch JPG/JPEG to PNG conversion',
          'Lossless PNG output with no further compression artifacts',
          'Preserves exact original image resolution',
          'Thumbnail previews for each queued file',
          'Individual and bulk download support',
          'Entirely client-side — no server uploads',
        ],
        benefits: [
          'A clean, lossless format for further image editing',
          'Better compatibility with tools that require PNG',
          'No quality degradation introduced by the conversion itself',
          'Fast, private processing with zero file uploads',
          'No installation or account required',
        ],
        howToUse: [
          'Drag and drop or browse to select your JPG/JPEG file(s)',
          'Wait for the automatic conversion to PNG to complete',
          'Preview the converted image thumbnail and file size',
          'Download the PNG file individually or download all at once',
        ],
        useCases: [
          { title: 'Preparing images for design software', description: 'Convert JPG photos to PNG before importing into design tools that prefer lossless formats.' },
          { title: 'Avoiding repeated JPG compression', description: 'Use PNG as an intermediate format during multi-step editing to prevent cumulative quality loss.' },
          { title: 'CMS or platform requirements', description: 'Meet upload requirements for systems that only accept PNG image files.' },
          { title: 'Archiving important photos', description: 'Store a lossless PNG copy of a JPG photo before performing further edits.' },
        ],
      },
    },
    {
      title: 'WebP Converter', slug: 'webp-converter', icon: '🌐',
      shortDescription: 'Convert images between WebP, JPG, and PNG formats in any direction.',
      fullDescription: 'A flexible, bidirectional image format converter that handles WebP, JPG, and PNG conversions in any direction. Pick your target format, adjust quality for lossy outputs, choose a background color when converting transparent images to JPG, and convert files in batches — all locally in your browser.',
      keywords: ['webp converter', 'webp to jpg', 'webp to png', 'jpg to webp', 'png to webp', 'convert webp online'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'What formats can I convert to and from?', answer: 'You can upload WebP, JPG, or PNG images and convert to any of WebP, JPG, or PNG as the target output format.' },
        { question: 'Why would I convert an image to WebP?', answer: 'WebP typically produces smaller file sizes than JPG or PNG at similar visual quality, making it a great choice for fast-loading websites, provided your target platform supports it.' },
        { question: 'Why would I convert WebP to JPG or PNG?', answer: 'Some older browsers, email clients, design tools, or social platforms don\'t fully support WebP, so converting to a more universally supported format like JPG or PNG ensures compatibility.' },
        { question: 'What happens to transparency when converting to JPG?', answer: 'Since JPG doesn\'t support transparency, any transparent areas in a WebP or PNG source are filled with a background color you choose before the JPG is created.' },
        { question: 'Is converting to PNG lossless?', answer: 'Yes, PNG output is always lossless — the quality slider only applies when converting to WebP or JPG.' },
        { question: 'Can I batch convert several files at once?', answer: 'Yes, upload multiple files and they will all be converted to your chosen target format using the same settings.' },
        { question: 'Does the browser support WebP natively for this conversion?', answer: 'Yes, modern browsers can both decode and encode WebP using the canvas API, which is what powers this tool entirely client-side.' },
        { question: 'Are my files uploaded to a server during conversion?', answer: 'No, all conversions happen locally in your browser. Your images are never transmitted anywhere.' },
        { question: 'Will the output have the same dimensions as the input?', answer: 'Yes, this tool only changes the file format and encoding, not the pixel dimensions.' },
      ],
      relatedTools: ['png-to-jpg', 'jpg-to-png', 'image-compressor', 'image-optimizer'],
      seoTitle: 'WebP Converter — Convert WebP, JPG & PNG Online Free | ToolifHub',
      seoDescription: 'Convert images between WebP, JPG, and PNG in any direction for free. Adjust quality, handle transparency, and batch convert — all in your browser.',
      seoContent: {
        overview: 'WebP has become the modern web\'s preferred image format thanks to its excellent compression efficiency, but compatibility gaps still exist with certain older tools, email clients, and design software. The WebP Converter is built to handle both directions of this problem: converting legacy JPG or PNG files into efficient WebP, and converting WebP back into more universally compatible JPG or PNG when needed.\n\nThe tool automatically detects your uploaded file\'s type and lets you choose any target format from a simple selector. When converting an image with transparency to JPG (which has no alpha channel), the tool walks you through choosing a background color so the result looks intentional rather than broken. Quality controls apply to lossy targets (WebP and JPG), while PNG output is always lossless.\n\nUnder the hood, conversion uses the HTML canvas element\'s native encoding support, which modern browsers handle for WebP just as reliably as for JPG and PNG. This means conversions are instant, accurate, and entirely private — nothing is sent to a server at any point.\n\nBatch support lets you process several images of mixed formats in a single session, each converted independently to your chosen target format, with live previews and individual or bulk downloads.',
        features: [
          'Bidirectional conversion: WebP ⇄ JPG ⇄ PNG',
          'Automatic detection of uploaded image type',
          'Adjustable quality slider for WebP and JPG outputs',
          'Background color picker for transparency when targeting JPG',
          'Lossless PNG output option',
          'Batch processing of multiple mixed-format files',
          'Live thumbnail previews of converted results',
          'Fully client-side — no uploads, no waiting on a server',
        ],
        benefits: [
          'Smaller file sizes by converting to WebP for modern websites',
          'Restored compatibility by converting WebP to JPG/PNG when needed',
          'One tool covers every common conversion direction',
          'Full control over quality and transparency handling',
          'Completely private with zero server-side processing',
        ],
        howToUse: [
          'Drag and drop or select your WebP, JPG, or PNG image(s)',
          'Choose your target output format from the format selector',
          'Adjust the quality slider if converting to WebP or JPG',
          'Pick a background color if converting a transparent image to JPG',
          'Review the converted preview and download individually or in bulk',
        ],
        useCases: [
          { title: 'Modernizing a website\'s images', description: 'Convert legacy JPG and PNG assets to WebP for faster page loads on supporting browsers.' },
          { title: 'Fixing compatibility issues', description: 'Convert WebP images to JPG or PNG when a platform, email client, or design tool can\'t open WebP files.' },
          { title: 'Mixed-format batch cleanup', description: 'Normalize a folder of images with mixed formats into a single consistent target format.' },
          { title: 'Email and document attachments', description: 'Convert WebP photos to JPG before attaching them to emails or documents that don\'t render WebP.' },
        ],
      },
    },
    {
      title: 'Image Resizer', slug: 'image-resizer', icon: '📐',
      shortDescription: 'Resize images to exact dimensions or by percentage, with common social media presets.',
      fullDescription: 'Resize any image to specific pixel dimensions, scale it by a percentage, or apply one of several common presets like 1920×1080, Instagram Square, or Open Graph image size. Maintain aspect ratio automatically or set custom width and height independently — all processed locally in your browser.',
      keywords: ['image resizer', 'resize image online', 'resize photo', 'image dimensions changer', 'resize image for instagram', 'og image resizer'],
      featured: true, trending: false, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'How do I resize an image to an exact size?', answer: 'Switch to "By Dimensions" mode, then type your desired width and height in pixels. If "Maintain aspect ratio" is enabled, the other dimension updates automatically to match the original proportions.' },
        { question: 'Can I resize by a percentage instead of exact pixels?', answer: 'Yes, switch to "By Percentage" mode and use the slider to scale the image up or down relative to its original size.' },
        { question: 'What are the preset sizes for?', answer: 'Presets like 1920×1080, 1280×720, 1080×1080 (Instagram Square), and 1200×630 (Open Graph image) instantly apply common dimensions used across social media, video thumbnails, and website link previews.' },
        { question: 'Does resizing reduce image quality?', answer: 'Resizing down generally preserves quality well. Resizing up (enlarging) beyond the original resolution can introduce some softness since new pixels are interpolated rather than captured.' },
        { question: 'What happens if I uncheck "maintain aspect ratio"?', answer: 'You can then set width and height independently, which may stretch or squash the image if the new ratio doesn\'t match the original.' },
        { question: 'What file formats are supported for resizing?', answer: 'You can upload most common image formats; the resized output is saved as PNG if the original was PNG, or JPG otherwise.' },
        { question: 'Is there a maximum size limit?', answer: 'There\'s no hardcoded limit, but extremely large target dimensions may take longer to render since resizing happens using your device\'s processing power.' },
        { question: 'Are my images uploaded to a server?', answer: 'No, resizing is done entirely client-side using the HTML canvas API, so your images never leave your browser.' },
      ],
      relatedTools: ['image-cropper', 'image-compressor', 'image-optimizer'],
      seoTitle: 'Image Resizer — Resize Images Online Free (Pixels or %) | ToolifHub',
      seoDescription: 'Resize images online for free by exact dimensions or percentage. Includes presets for Instagram, OG images, and HD video. Fast, private, browser-based.',
      seoContent: {
        overview: 'Different platforms expect different image dimensions — a YouTube thumbnail, an Instagram post, and an Open Graph social preview image all have distinct ideal sizes. The Image Resizer gives you precise control to hit these targets without opening a heavyweight desktop editor. Set an exact pixel width and height, scale proportionally by percentage, or click one of the built-in presets for instant results.\n\nThe aspect ratio lock makes everyday resizing painless: change the width and the height adjusts automatically to keep your image looking correct, with no manual math required. When you do need independent control — say, to force a square crop-like resize for a specific layout — simply turn off aspect ratio locking and set both values directly.\n\nFor situations where you just need to make an image "a bit smaller" or "twice as big" without worrying about exact numbers, percentage mode lets you scale relative to the original size using a simple slider, with the resulting pixel dimensions shown live as you adjust.\n\nBuilt-in presets cover the most commonly requested sizes: 1920×1080 and 1280×720 for HD video and screenshots, 1080×1080 for Instagram\'s square format, 1200×630 for Open Graph link previews, and 800×600 for general-purpose use. All resizing happens instantly using your browser\'s canvas rendering, with results downloadable immediately — no server round trip involved.',
        features: [
          'Resize by exact width and height in pixels',
          'Resize by percentage with a live slider',
          'Aspect ratio lock toggle for proportional resizing',
          'One-click presets for HD, Instagram Square, and OG Image sizes',
          'Live preview of resulting dimensions before resizing',
          'Canvas-based resizing that runs entirely in your browser',
          'Instant download of the resized result',
        ],
        benefits: [
          'Hit exact platform-required dimensions in seconds',
          'No guesswork with aspect-ratio-locked resizing',
          'Common presets eliminate manual dimension lookup',
          'No software installation or account required',
          'Completely private — no images are uploaded',
        ],
        howToUse: [
          'Upload the image you want to resize',
          'Choose "By Dimensions" or "By Percentage" mode',
          'Enter custom width/height, drag the percentage slider, or click a preset',
          'Toggle "Maintain aspect ratio" on or off depending on your needs',
          'Click "Resize Image" and download the result',
        ],
        useCases: [
          { title: 'Social media post sizing', description: 'Resize a photo to 1080×1080 for a perfectly cropped Instagram square post.' },
          { title: 'Open Graph preview images', description: 'Create a 1200×630 image so your page looks great when shared on Facebook, LinkedIn, or Slack.' },
          { title: 'Video thumbnail prep', description: 'Resize artwork to 1920×1080 or 1280×720 for YouTube or streaming thumbnails.' },
          { title: 'Reducing oversized uploads', description: 'Scale down a high-resolution camera photo by percentage before uploading it to a form with size limits.' },
        ],
      },
    },
    {
      title: 'Image Cropper', slug: 'image-cropper', icon: '✂️',
      shortDescription: 'Crop, rotate, zoom, and create circular crops of any image with precise drag controls.',
      fullDescription: 'An interactive image cropping tool with a draggable, resizable crop box, common aspect ratio presets (1:1, 4:3, 16:9, 9:16, or free-form), a circle crop mode, zoom slider, and rotation controls including 90° quick-rotate buttons and a free-rotate slider. Export your crop directly to a downloadable file, all processed locally in your browser.',
      keywords: ['image cropper', 'crop image online', 'circle crop tool', 'crop photo free', 'aspect ratio cropper', 'rotate and crop image'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'How do I move or resize the crop box?', answer: 'Click and drag anywhere inside the crop box to move it. Drag any of the four corner handles to resize it, and the box will respect your selected aspect ratio if one is set.' },
        { question: 'What aspect ratio options are available?', answer: 'You can choose Free (any shape), 1:1 (square), 4:3, 16:9 (widescreen), or 9:16 (portrait/stories format).' },
        { question: 'How does the circle crop work?', answer: 'Toggle "Circle crop" on and your final exported image will be clipped into a circle inscribed within your crop box selection — perfect for profile pictures and avatars.' },
        { question: 'Can I rotate the image before cropping?', answer: 'Yes, use the 90° rotate buttons for quick quarter-turns, or the free-rotate slider for any angle between 0 and 359 degrees.' },
        { question: 'What does the zoom slider do?', answer: 'It zooms the source image within the crop stage, letting you crop in tighter on a specific area without needing to shrink the crop box itself.' },
        { question: 'What format is the final cropped file?', answer: 'If circle crop is enabled, or your original was a PNG, the export is a transparent PNG. Otherwise it exports as a JPG.' },
        { question: 'Is the crop tool accurate for high-resolution images?', answer: 'Yes, the crop coordinates are mapped back to your image\'s full original resolution, so the exported crop is rendered at full quality, not just the screen preview size.' },
        { question: 'Does cropping happen on a server?', answer: 'No, all cropping, rotation, and zoom math happens locally using the HTML canvas API in your browser. Your image is never uploaded.' },
      ],
      relatedTools: ['remove-background', 'image-resizer', 'png-to-jpg'],
      seoTitle: 'Image Cropper — Crop, Rotate & Circle Crop Online Free | ToolifHub',
      seoDescription: 'Crop images online for free with draggable crop box, aspect ratio presets, circle crop, zoom, and rotation. Fast, private, browser-based cropping.',
      seoContent: {
        overview: 'Cropping is one of the most common image edits, yet many free online croppers feel clunky or limited. The Image Cropper is built around a smooth, draggable crop box with proper corner-handle resizing, so you can select exactly the region you want with precision similar to a desktop editor — directly in your browser.\n\nAspect ratio presets make common crops effortless: lock to 1:1 for a perfect square profile picture, 16:9 for a widescreen thumbnail, 9:16 for vertical stories and reels, or 4:3 for traditional photo framing. Free mode removes all constraints when you need full creative control over the crop shape.\n\nBeyond basic rectangular crops, the tool includes a dedicated circle crop mode, ideal for avatars and profile photos, which clips your selection into a perfect circle on export. Combined with a zoom slider to get closer to fine details and rotation controls — both quick 90-degree steps and a free-rotate slider for any angle — you have a complete set of adjustments before finalizing your crop.\n\nAll of the math for mapping your on-screen crop selection back to the image\'s full native resolution happens automatically, so your final exported file is rendered at full quality rather than a downscaled preview. As with the rest of this tool suite, everything runs locally via the canvas API; no image data is ever sent to a server.',
        features: [
          'Draggable, resizable crop box with corner handles',
          'Aspect ratio presets: Free, 1:1, 4:3, 16:9, 9:16',
          'Circle crop mode for avatars and profile pictures',
          'Zoom slider to crop in tighter on image details',
          'Quick 90° rotate buttons plus a free-rotate slider',
          'Full-resolution export regardless of on-screen preview size',
          'One-click "Crop & Download" export',
          'Entirely client-side processing with no uploads',
        ],
        benefits: [
          'Precise, desktop-editor-like cropping in the browser',
          'Built-in presets remove the need to calculate ratios manually',
          'Perfect circular avatars without extra software',
          'Rotate and crop in a single streamlined workflow',
          'Private — your photos are never uploaded anywhere',
        ],
        howToUse: [
          'Upload the image you want to crop',
          'Choose an aspect ratio preset, or leave it free-form',
          'Drag the crop box into position and resize using the corner handles',
          'Optionally zoom in, rotate, or enable circle crop',
          'Click "Crop & Download" to save your final cropped image',
        ],
        useCases: [
          { title: 'Profile picture avatars', description: 'Use circle crop with a 1:1 ratio to create a perfectly round profile photo for social platforms.' },
          { title: 'Story and reel formatting', description: 'Crop a photo to a 9:16 ratio for Instagram Stories, Reels, or TikTok-style vertical content.' },
          { title: 'Removing unwanted background', description: 'Tighten the crop box around just the subject of a photo to remove distracting surroundings.' },
          { title: 'Straightening tilted photos', description: 'Use the free-rotate slider to level a slightly tilted photo before applying the final crop.' },
        ],
      },
    },
    {
      title: 'Remove Background', slug: 'remove-background', icon: '🪄',
      shortDescription: 'Automatically remove the background from any photo using on-device AI.',
      fullDescription: 'Upload a photo and automatically remove its background using an AI model that runs entirely inside your browser via WebAssembly — no images are ever uploaded to a server. View a side-by-side before/after comparison with a transparent checkerboard background, then download the result as a transparent PNG.',
      keywords: ['remove background from image', 'background remover', 'transparent background tool', 'ai background removal', 'cut out image background'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'How does background removal work without uploading my photo?', answer: 'The tool uses an AI segmentation model that runs locally in your browser using WebAssembly. Your image is processed entirely on your device — it\'s never sent to any server.' },
        { question: 'What browsers support this tool?', answer: 'You need a modern browser with WebAssembly and SharedArrayBuffer support, such as a recent version of Chrome, Edge, or Firefox. If unsupported, the tool will clearly tell you instead of failing silently.' },
        { question: 'What format is the result saved as?', answer: 'The output is always a transparent PNG, since PNG is the only common format that supports an alpha (transparency) channel.' },
        { question: 'Why does processing take a little while?', answer: 'The AI model needs to download (the first time) and run inference locally on your device, which can take a few seconds to a minute depending on your hardware and image size.' },
        { question: 'Does it work well on all types of photos?', answer: 'It works best on photos with a clear subject like a person, product, or animal against a reasonably distinct background. Very busy or low-contrast scenes may produce a less clean cutout.' },
        { question: 'Can I see progress while it processes?', answer: 'Yes, a progress bar shows real-time status as the model downloads and processes your image.' },
        { question: 'Is there a file size limit?', answer: 'Very large images may take longer to process since everything runs on your device. For best performance, typical photo resolutions work well.' },
        { question: 'Can I undo or try again with a different photo?', answer: 'Yes, use the Reset button to clear the current image and upload a new one.' },
      ],
      relatedTools: ['image-cropper', 'png-to-jpg', 'image-resizer'],
      seoTitle: 'Remove Background from Image — Free AI Tool, No Upload | ToolifHub',
      seoDescription: 'Remove the background from any photo for free using on-device AI. No uploads — processing runs entirely in your browser. Download as a transparent PNG.',
      seoContent: {
        overview: 'Removing a background traditionally meant careful manual selection in a photo editor, or uploading your photo to a third-party service and hoping they handle your data responsibly. This tool takes a different approach: it runs a genuine AI segmentation model directly inside your browser using WebAssembly, meaning your photo is analyzed and the background removed without ever being transmitted to a server.\n\nWhen you upload an image, the tool first checks that your browser supports the necessary WebAssembly and SharedArrayBuffer features. If it doesn\'t — which can happen in some privacy-focused browser configurations or older browsers — you\'ll see a clear explanation rather than a confusing failure.\n\nOnce processing starts, you\'ll see a live progress bar as the AI model works through your image. The result is displayed side-by-side with your original: the original photo on the left, and the background-removed result on the right, shown over a checkerboard pattern so you can clearly see which areas are now transparent.\n\nThe final output is always a transparent PNG, ready to drop onto any new background, use as a sticker-style cutout, or place into a design project. Because the heavy lifting happens entirely on your device, there\'s no per-image cost, no rate limit tied to a paid API, and no concern about your photos being stored or analyzed by a third party.',
        features: [
          'On-device AI background removal via WebAssembly',
          'No image uploads — 100% local processing',
          'Clear browser-compatibility detection with graceful fallback messaging',
          'Real-time progress bar during processing',
          'Side-by-side before/after comparison over a checkerboard backdrop',
          'Transparent PNG export ready for any new background',
          'One-click reset to process another photo',
        ],
        benefits: [
          'Complete privacy — your photos never leave your device',
          'No usage limits tied to a third-party API',
          'Professional-looking cutouts without manual selection tools',
          'Works for product photos, portraits, and more',
          'Free to use with no account or subscription required',
        ],
        howToUse: [
          'Upload a photo with a clear subject',
          'Wait for the on-device AI model to process the image, tracked by a progress bar',
          'Compare the original and the background-removed result side-by-side',
          'Download the result as a transparent PNG',
          'Click Reset to process another image if needed',
        ],
        useCases: [
          { title: 'E-commerce product cutouts', description: 'Remove backgrounds from product photos to create clean, consistent catalog images.' },
          { title: 'Profile picture editing', description: 'Cut out a portrait subject to place on a new background or solid color.' },
          { title: 'Design and collage work', description: 'Extract subjects from photos to combine into graphics, posters, or social media designs.' },
          { title: 'Sticker-style image creation', description: 'Create transparent PNG cutouts for use as overlay stickers or watermark-free graphics.' },
        ],
      },
    },
    {
      title: 'Image Metadata Viewer', slug: 'image-metadata-viewer', icon: '🔍',
      shortDescription: 'View EXIF, IPTC, XMP, and GPS metadata embedded in any photo.',
      fullDescription: 'Inspect the hidden metadata embedded in your photos, including camera make and model, lens, exposure settings, ISO, focal length, color profile, and GPS location if present. View results in an organized, readable layout, then copy the data as JSON or download it as a file.',
      keywords: ['image metadata viewer', 'exif viewer', 'photo metadata checker', 'view exif data online', 'gps location in photo', 'check image metadata'],
      featured: false, trending: false, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'What metadata can this tool read?', answer: 'It reads EXIF (camera and capture settings), IPTC (descriptive/copyright info), XMP (Adobe and other software metadata), ICC color profile data, and GPS location data if embedded in the file.' },
        { question: 'Why doesn\'t my photo show any camera information?', answer: 'Many images have their metadata stripped by messaging apps, social media platforms, or screenshot tools before you download them, so there may simply be nothing left to read.' },
        { question: 'Will this tool show my photo\'s exact location?', answer: 'Only if GPS coordinates are embedded in the file\'s metadata. If present, you\'ll see the coordinates along with a "View on map" link to open the location in Google Maps.' },
        { question: 'Can I export the metadata?', answer: 'Yes, use "Copy metadata as JSON" to copy it to your clipboard, or "Download as JSON" to save it as a file.' },
        { question: 'Is my photo uploaded anywhere to read its metadata?', answer: 'No, metadata extraction happens entirely client-side in your browser using a JavaScript parsing library. Your photo is never uploaded.' },
        { question: 'What does ISO, aperture, and focal length tell me?', answer: 'These are camera exposure settings recorded at the moment the photo was taken — ISO reflects sensor sensitivity, aperture (f-number) reflects how much light the lens let in, and focal length describes the lens zoom level used.' },
        { question: 'Can I check metadata for screenshots?', answer: 'Yes, but screenshots typically contain little to no EXIF data since they aren\'t captured by a camera sensor.' },
        { question: 'Does this tool modify my photo?', answer: 'No, this is a read-only viewer. It does not alter your original file in any way. Use the Remove EXIF Data tool if you want to strip metadata.' },
      ],
      relatedTools: ['remove-exif', 'image-compressor'],
      seoTitle: 'Image Metadata Viewer — View EXIF & GPS Data Online Free | ToolifHub',
      seoDescription: 'View EXIF, IPTC, XMP, and GPS metadata hidden in any photo for free. See camera settings and location data, then export as JSON. All processed locally.',
      seoContent: {
        overview: 'Every photo taken with a digital camera or smartphone typically carries hidden metadata describing how and where it was captured. The Image Metadata Viewer extracts and presents this information in a clean, organized layout, covering EXIF camera settings, IPTC descriptive fields, XMP software metadata, embedded color profile details, and GPS location data when present.\n\nUpload any photo and the tool immediately surfaces useful technical details: the camera make and model, lens used, exposure time, ISO sensitivity, aperture, and focal length — everything a photographer might want to review about how a shot was taken. Basic file information like dimensions, format, and file size rounds out the picture.\n\nIf GPS coordinates are embedded in the file (common with many smartphone photos unless location services were disabled), the tool displays the exact latitude and longitude along with a direct "View on map" link that opens the location in Google Maps. This same GPS exposure is also a useful privacy check — many people don\'t realize their photos contain their exact capture location until they see it laid out clearly.\n\nFor anyone who needs to document or archive this information, the full metadata set can be copied to the clipboard as JSON or downloaded as a standalone JSON file. As with every tool in this suite, all extraction happens locally in your browser using a dedicated metadata-parsing library — your photo is never uploaded anywhere.',
        features: [
          'Reads EXIF, IPTC, XMP, ICC color profile, and GPS metadata',
          'Displays camera make, model, lens, exposure, ISO, and focal length',
          'Shows basic file info: dimensions, format, size, and resolution',
          'GPS coordinates with a direct "View on map" link when available',
          'Copy metadata to clipboard as JSON',
          'Download full metadata as a JSON file',
          'Entirely client-side parsing — no image uploads',
        ],
        benefits: [
          'Understand exactly how and with what settings a photo was taken',
          'Quickly check whether a photo reveals its capture location',
          'Useful for photographers reviewing shooting settings',
          'Easy export for documentation or technical records',
          'No privacy risk since photos are never uploaded',
        ],
        howToUse: [
          'Upload the photo whose metadata you want to inspect',
          'Review the organized display of file info, camera details, and GPS data',
          'Click the map link if GPS coordinates are present and you want to see the location',
          'Use "Copy metadata as JSON" or "Download as JSON" to export the data',
        ],
        useCases: [
          { title: 'Photography settings review', description: 'Check the exact ISO, aperture, and shutter speed used for a favorite shot to learn from it.' },
          { title: 'Privacy auditing before sharing', description: 'Check whether a photo contains embedded GPS coordinates before posting it publicly.' },
          { title: 'Verifying image authenticity context', description: 'Review capture date, camera model, and software tags as part of basic image provenance checks.' },
          { title: 'Technical documentation', description: 'Export metadata as JSON for inclusion in photography portfolios, technical reports, or archives.' },
        ],
      },
    },
    {
      title: 'Remove EXIF Data', slug: 'remove-exif', icon: '🛡️',
      shortDescription: 'Strip all EXIF, GPS, and metadata from your photos before sharing them.',
      fullDescription: 'Protect your privacy by removing all embedded EXIF, IPTC, XMP, and GPS metadata from your photos before sharing them online. The tool re-encodes your image on a fresh canvas, which strips hidden metadata, and shows a clear before/after indicator confirming the metadata was removed.',
      keywords: ['remove exif data', 'strip metadata from photo', 'remove gps location from image', 'clean image metadata', 'privacy photo tool'],
      featured: false, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'Why should I remove EXIF data from my photos?', answer: 'EXIF data can include your exact GPS location, device model, and capture timestamp. Removing it before sharing online helps protect your privacy and avoids unintentionally revealing where a photo was taken.' },
        { question: 'How does this tool remove the metadata?', answer: 'It loads your image onto a fresh HTML canvas and re-exports it as a new file. This re-encoding process does not carry over the original EXIF, IPTC, XMP, or GPS metadata.' },
        { question: 'Will the image quality change?', answer: 'For JPG output, the tool re-encodes at a high quality setting (~92%) to keep visual changes minimal. PNG output remains fully lossless.' },
        { question: 'How do I know the metadata was actually removed?', answer: 'The tool checks your original file\'s metadata first and shows whether it contained data, then confirms the cleaned output has none, so you can verify the result directly.' },
        { question: 'Does this change my photo\'s dimensions?', answer: 'No, the output keeps the exact same width and height as your original image.' },
        { question: 'Is my photo uploaded anywhere during this process?', answer: 'No, the entire process — reading metadata and re-encoding the image — happens locally in your browser. Nothing is sent to a server.' },
        { question: 'What output format will I get?', answer: 'PNG inputs are re-encoded as PNG; all other formats (including JPG) are re-encoded as JPG at high quality.' },
        { question: 'Should I use this before posting photos on social media?', answer: 'It\'s a good practice, especially for photos taken on a smartphone, since many phones embed GPS coordinates by default unless location tagging is disabled.' },
      ],
      relatedTools: ['image-metadata-viewer', 'image-compressor'],
      seoTitle: 'Remove EXIF Data — Strip Photo Metadata & GPS Online Free | ToolifHub',
      seoDescription: 'Remove EXIF, GPS, and metadata from your photos for free before sharing online. Privacy-focused tool that re-encodes images locally in your browser.',
      seoContent: {
        overview: 'Most photos taken on a smartphone or digital camera carry far more hidden information than people realize — including, in many cases, the exact GPS coordinates of where the photo was taken. Before sharing a photo publicly online, it\'s worth stripping this data so you don\'t unintentionally reveal your location, device details, or other personal information.\n\nThe Remove EXIF Data tool addresses this directly. Instead of attempting to selectively edit metadata fields (which can be error-prone), it takes the more reliable approach of loading your image onto a brand-new canvas and re-exporting it as a fresh file. This re-encoding process naturally does not carry forward the original file\'s EXIF, IPTC, XMP, or GPS metadata, because the new file is generated from raw pixel data alone.\n\nTo give you confidence in the result, the tool first checks your original file for metadata using the same parsing technology as the Image Metadata Viewer, showing you whether the original contained data and roughly how many fields. After cleaning, you can see the size comparison and a clear confirmation that the metadata has been removed.\n\nQuality is preserved carefully during this process: JPG outputs are re-encoded at a high 92% quality setting to keep visual differences minimal, while PNG outputs remain fully lossless. As with every tool in this collection, the entire operation runs locally in your browser — your photo, and the sensitive metadata it might contain, are never transmitted to any server.',
        features: [
          'Strips EXIF, IPTC, XMP, and GPS metadata via canvas re-encoding',
          'Before/after indicator confirming metadata presence and removal',
          'High-quality JPG re-encoding (~92%) to minimize visual change',
          'Fully lossless PNG re-encoding when applicable',
          'Privacy-notice callout explaining what the tool does and why',
          'Single-click download of the cleaned file',
          'Entirely client-side — no uploads of sensitive image data',
        ],
        benefits: [
          'Protects your location privacy before sharing photos online',
          'Removes device and software fingerprinting metadata',
          'Minimal visual quality impact thanks to high-quality re-encoding',
          'Clear confirmation that metadata was actually removed',
          'No account, install, or server upload required',
        ],
        howToUse: [
          'Upload the photo you want to clean',
          'Review the before indicator showing whether metadata was detected',
          'Wait for the tool to re-encode the image on a clean canvas',
          'Check the after indicator confirming metadata removal',
          'Download the clean, metadata-free file',
        ],
        useCases: [
          { title: 'Social media privacy', description: 'Strip GPS and device metadata from vacation or home photos before posting them publicly.' },
          { title: 'Selling items online', description: 'Remove metadata from product photos in online marketplace listings to avoid revealing your address.' },
          { title: 'Journalism and whistleblowing', description: 'Remove identifying metadata from photos shared as part of sensitive reporting or documentation.' },
          { title: 'General digital hygiene', description: 'Routinely clean metadata from photos before uploading them anywhere outside your personal devices.' },
        ],
      },
    },
    {
      title: 'Image Optimizer', slug: 'image-optimizer', icon: '⚡',
      shortDescription: 'One-click image optimization for the web with smart, automatic size and quality defaults.',
      fullDescription: 'Optimize images for the web with a single click. The tool automatically picks smart compression settings based on your image\'s original size — no configuration needed — while power users can expand "Advanced settings" to fine-tune quality manually. See before/after size comparisons instantly.',
      keywords: ['image optimizer', 'optimize image for web', 'one click image compression', 'web image optimization tool', 'reduce image size for website'],
      featured: true, trending: true, status: 'active', visibility: 'worldwide',
      faq: [
        { question: 'How is this different from the Image Compressor?', answer: 'The Image Compressor gives you full manual control over the quality slider from the start. The Image Optimizer is designed for a faster, one-click workflow: it automatically picks smart settings based on your image\'s size, with manual controls tucked away in an optional "Advanced settings" panel.' },
        { question: 'What does "smart defaults" mean exactly?', answer: 'The tool looks at your original file size and automatically chooses an appropriate target size and quality level — larger source files get slightly more aggressive optimization, while smaller files use gentler settings to preserve quality.' },
        { question: 'Can I still control the quality manually?', answer: 'Yes, open the "Advanced settings" panel to reveal a quality slider that overrides the automatic defaults for power users who want precise control.' },
        { question: 'Will optimizing resize my image?', answer: 'The optimizer may cap very large images to a maximum dimension (1920px on the longest side) since that\'s sufficient for virtually all web use cases, which also helps reduce file size further.' },
        { question: 'Can I optimize multiple images at once?', answer: 'Yes, upload several images and click "Optimize All" to process the entire batch using the same smart or advanced settings.' },
        { question: 'Is this suitable for product photos and blog images?', answer: 'Yes, it\'s specifically designed for general web-use cases like blog images, product photos, and page assets where fast loading matters more than print-level fidelity.' },
        { question: 'Does optimization happen on a server?', answer: 'No, all optimization runs locally in your browser. Your images are never uploaded.' },
        { question: 'How much size reduction can I expect?', answer: 'Results vary by image, but it\'s common to see 50-80% size reduction on typical photographic images with minimal visible quality loss.' },
      ],
      relatedTools: ['image-compressor', 'image-resizer', 'webp-converter'],
      seoTitle: 'Image Optimizer — One-Click Web Image Optimization Free | ToolifHub',
      seoDescription: 'Optimize images for the web in one click with smart automatic compression. Advanced settings available for power users. Fast, free, browser-based.',
      seoContent: {
        overview: 'Not everyone wants to tune compression sliders manually — sometimes you just want an image that\'s ready for the web, fast. The Image Optimizer is built around that exact need: upload your image, click one prominent "Optimize" button, and get a smartly compressed result without making a single decision about quality percentages or target file sizes.\n\nBehind the scenes, the tool inspects your original file size and automatically selects an appropriate compression strategy — larger source files receive a slightly more aggressive size target and quality level, while smaller files are treated more gently to avoid unnecessary quality loss. It also caps maximum dimensions at 1920 pixels on the longest side by default, since that comfortably covers virtually every web display scenario while meaningfully reducing file size for oversized camera photos.\n\nFor users who want more control, an "Advanced settings" panel can be expanded to reveal a manual quality slider that overrides the automatic defaults. This keeps the default experience dead simple while still supporting power users who have specific quality requirements.\n\nAfter optimization, you immediately see a clear before-and-after file size comparison with the percentage reduction achieved, so you know exactly how much smaller your web-ready image has become. Batch support lets you optimize several images in one pass, each tracked with its own progress and result, all without ever uploading a single byte to a server.',
        features: [
          'One-click "Optimize" button with zero required configuration',
          'Automatic smart compression settings based on original file size',
          'Maximum dimension capping (1920px) tuned for web use',
          'Optional "Advanced settings" panel with a manual quality slider',
          'Before/after size comparison with percentage reduction',
          'Batch optimization of multiple images at once',
          'Per-file progress and individual or bulk downloads',
          'Fully client-side processing — no server uploads',
        ],
        benefits: [
          'Fastest path to web-ready images with zero decisions required',
          'Smart defaults avoid both over-compression and under-compression',
          'Power-user controls available without cluttering the default flow',
          'Significant file size savings with minimal visible quality loss',
          'Completely private — images never leave your browser',
        ],
        howToUse: [
          'Upload one or more images you want optimized for the web',
          'Click the "Optimize" button to apply smart automatic settings',
          'Optionally expand "Advanced settings" to set a manual quality level first',
          'Review the before/after size comparison for each file',
          'Download the optimized image(s) individually or all at once',
        ],
        useCases: [
          { title: 'Quick blog post image prep', description: 'Optimize a batch of article images in seconds before publishing, without manually tuning each one.' },
          { title: 'Improving page load speed', description: 'Shrink oversized hero images and banners to improve site performance scores.' },
          { title: 'Bulk product photo cleanup', description: 'Run an entire folder of e-commerce photos through one-click optimization before uploading to a storefront.' },
          { title: 'Non-technical users needing fast results', description: 'Give less technical users a simple way to make images web-ready without understanding compression settings.' },
        ],
      },
    },
  
];

async function run() {
  console.log('🌱 Adding Image Tools batch (non-destructive)...\n');
  await mongoose.connect(MONGODB_URI, { dbName: DATABASE_NAME });
  console.log('✅ Connected to MongoDB:', mongoose.connection.db.databaseName, '\n');

  let category = await Category.findOne({ slug: 'image-tools' });
  if (!category) {
    category = await Category.create({
      name: 'Image Tools', slug: 'image-tools', icon: '🖼️',
      description: 'Edit, convert, compress, and transform images directly in your browser.',
      featured: false, order: 5,
    });
    console.log('   + Created "Image Tools" category (it didn\'t exist)\n');
  } else {
    console.log('   Using existing "Image Tools" category\n');
  }

  let created = 0, skipped = 0;
  for (const tool of IMAGE_TOOLS) {
    const exists = await Tool.findOne({ slug: tool.slug });
    if (exists) {
      console.log(`   ~ Skipped (already exists): ${tool.title}`);
      skipped++;
      continue;
    }
    await Tool.create({ ...tool, category: category._id });
    console.log(`   + Added: ${tool.title}`);
    created++;
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`🎉 Done. ${created} tool(s) added, ${skipped} already existed and were left untouched.`);
  console.log('─'.repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
