'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  disabled?: boolean;
}

export default function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) return;
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleClick = () => {
    if (!preview) inputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative w-full aspect-video rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden ${
        dragOver
          ? 'border-tma-accent bg-tma-accent/5'
          : preview
          ? 'border-tma-accent/40 bg-tma-card'
          : 'border-tma-border bg-tma-card hover:border-tma-muted'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearImage();
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/50">
            <ImageIcon size={12} className="text-tma-accent" />
            <span className="text-[10px] text-white/80">Изображение загружено</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-6">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              dragOver ? 'bg-tma-accent/20' : 'bg-tma-border/50'
            }`}
          >
            <Upload
              size={22}
              className={`transition-colors ${dragOver ? 'text-tma-accent' : 'text-tma-muted'}`}
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-tma-muted">
              {dragOver ? 'Отпустите для загрузки' : 'Перетащите изображение сюда'}
            </p>
            <p className="text-[10px] text-tma-muted/60 mt-0.5">или нажмите для выбора файла</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
