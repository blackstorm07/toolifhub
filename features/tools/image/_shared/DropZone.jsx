'use client';

import { useRef, useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

export default function DropZone({
  accept = 'image/*',
  multiple = false,
  onFiles,
  label,
  hint,
}) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = useCallback(
    (fileList) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      onFiles?.(files);
    },
    [onFiles]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer?.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const openPicker = () => inputRef.current?.click();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPicker();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label || 'Upload image, click or drag and drop'}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
        isDragOver
          ? 'border-brand-500 bg-brand-500/5'
          : 'border-border bg-muted/30 hover:bg-muted/50'
      }`}
    >
      <UploadCloud className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium text-sm sm:text-base">
        {label || 'Drag & drop image(s) here, or click to browse'}
      </p>
      <p className="text-xs text-muted-foreground">
        {hint || 'Your files are processed locally in your browser and never uploaded.'}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
