'use client';
import { useState, useRef, useEffect } from 'react';

interface ImageUploaderProps {
  label?: string;
  currentUrl?: string;
  folder: string;
  resourceType?: 'image' | 'raw' | 'auto';
  onUpload?: (url: string) => void;
  onUploadMultiple?: (urls: string[]) => void;
  accept?: string;
  multiple?: boolean;
}

export default function ImageUploader({
  label = 'Upload File',
  currentUrl,
  folder,
  resourceType = 'image',
  onUpload,
  onUploadMultiple,
  accept = 'image/*',
  multiple = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl || '');
  }, [currentUrl]);

  // Function to delete file from Cloudinary via API
  const deleteFile = async (urlToDelete: string) => {
    if (!urlToDelete || !urlToDelete.includes('cloudinary')) return;
    try {
      await fetch('/api/upload/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToDelete }),
      });
    } catch (err) {
      console.error('Failed to delete file from Cloudinary:', err);
    }
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');

    // Capture existing file URL before starting new upload
    const fileToDelete = preview || currentUrl;

    const fileArray = Array.from(files);
    const uploadedUrls: string[] = [];

    try {
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        formData.append('resourceType', resourceType);

        // 1. Upload new file
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        uploadedUrls.push(data.url);

        if (!multiple && onUpload) {
          setPreview(data.url);
          onUpload(data.url);

          // 2. Delete existing file right after successful upload
          if (fileToDelete && fileToDelete !== data.url) {
            await deleteFile(fileToDelete);
          }
        }
      }

      if (multiple && onUploadMultiple && uploadedUrls.length > 0) {
        onUploadMultiple(uploadedUrls);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed border-white/20 rounded-xl p-6 cursor-pointer hover:border-white/40 transition-colors flex flex-col items-center justify-center gap-3 bg-white/5 min-h-[120px]"
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Uploading {multiple ? 'files' : 'file'}...</span>
          </div>
        ) : preview && !multiple ? (
          <div className="flex flex-col items-center gap-2 w-full">
            {resourceType !== 'raw' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="max-h-32 rounded object-contain" />
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <span>📄</span>
                <span className="text-sm truncate max-w-[200px]">{preview.split('/').pop()}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">Click or drag to replace</p>
          </div>
        ) : (
          <>
            <span className="text-3xl">📁</span>
            <p className="text-sm text-gray-400 text-center">
              {multiple ? 'Click or drag multiple image files here' : 'Click or drag file here to upload'}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          }}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {preview && !multiple && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={preview}
            onChange={(e) => {
              setPreview(e.target.value);
              onUpload?.(e.target.value);
            }}
            className="flex-1 bg-white/5 border border-white/20 rounded px-3 py-1.5 text-xs text-gray-400 font-mono"
            placeholder="Or paste URL directly"
          />
        </div>
      )}
    </div>
  );
}