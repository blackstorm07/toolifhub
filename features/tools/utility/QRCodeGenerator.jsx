'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';
import { copyToClipboard } from '@/lib/utils';
import { trackToolUsage } from '@/lib/analytics';
import toast from 'react-hot-toast';

export default function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [svgString, setSvgString] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const render = useCallback(async (value) => {
    if (!value.trim()) {
      setSvgString('');
      setError('');
      return;
    }
    try {
      const svg = await QRCode.toString(value, { type: 'svg', width: 280, margin: 1 });
      setSvgString(svg);
      setError('');
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, value, { width: 280, margin: 1 });
      }
    } catch (e) {
      setError('Could not generate a QR code for this input');
      setSvgString('');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => render(text), 250);
    return () => clearTimeout(timer);
  }, [text, render]);

  const handleGenerateTracked = () => {
    if (text.trim()) trackToolUsage('qr-code-generator', 'QR Code Generator');
  };

  const downloadPNG = () => {
    if (!canvasRef.current || !svgString) return;
    handleGenerateTracked();
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.png';
    a.click();
  };

  const downloadSVG = () => {
    if (!svgString) return;
    handleGenerateTracked();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async () => {
    await copyToClipboard(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="text-sm font-medium">Text or URL</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com or any text"
          rows={6}
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        {text && (
          <button onClick={copyText} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            Copy text
          </button>
        )}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">QR Code Preview</label>
        <div className="aspect-square w-full max-w-[280px] mx-auto rounded-xl border border-border bg-white flex items-center justify-center p-4">
          <canvas ref={canvasRef} className={`w-full h-full ${svgString ? '' : 'hidden'}`} />
          {!svgString && (
            <p className="text-sm text-muted-foreground text-center px-4">Enter text to generate a QR code</p>
          )}
        </div>
        {svgString && (
          <div className="flex gap-3">
            <button
              onClick={downloadPNG}
              className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" /> PNG
            </button>
            <button
              onClick={downloadSVG}
              className="flex-1 flex items-center justify-center gap-2 h-10 px-4 border border-border hover:bg-muted text-sm font-medium rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" /> SVG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
