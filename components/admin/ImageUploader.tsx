'use client';
import { useState, useRef, useEffect } from 'react';

export async function uploadFileToCloudinary(
  file: File,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('resourceType', resourceType);

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

interface ImageUploaderProps {
  label?: string;
  currentUrl?: string;
  folder: string;
  resourceType?: 'image' | 'raw' | 'auto';
  onFileSelect?: (file: File | null, previewUrl: string) => void;
  onFilesSelectMultiple?: (files: File[], previewUrls: string[]) => void;
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
  onFileSelect,
  onFilesSelectMultiple,
  onUpload,
  onUploadMultiple,
  accept = 'image/*',
  multiple = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || '');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl || '');
    if (!currentUrl) {
      setSelectedFileName('');
    }
  }, [currentUrl]);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setError('');

    const fileArray = Array.from(files);

    // If deferred callbacks are provided (or by default in new workflow), handle locally without API call
    if (onFileSelect || onFilesSelectMultiple || (!onUpload && !onUploadMultiple)) {
      if (multiple) {
        const previewUrls = fileArray.map((f) => URL.createObjectURL(f));
        onFilesSelectMultiple?.(fileArray, previewUrls);
      } else {
        const singleFile = fileArray[0];
        const previewUrl = URL.createObjectURL(singleFile);
        setPreview(previewUrl);
        setSelectedFileName(singleFile.name);
        onFileSelect?.(singleFile, previewUrl);
        if (onUpload) onUpload(previewUrl);
      }
      return;
    }

    // Fallback immediate upload mode (if only legacy onUpload is provided without onFileSelect)
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of fileArray) {
        const url = await uploadFileToCloudinary(file, folder, resourceType);
        uploadedUrls.push(url);

        if (!multiple && onUpload) {
          setPreview(url);
          setSelectedFileName(file.name);
          onUpload(url);
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

  const getDisplayName = () => {
    if (selectedFileName) return selectedFileName;
    if (!preview) return '';
    try {
      const parts = preview.split('/');
      const last = parts[parts.length - 1];
      return decodeURIComponent(last);
    } catch {
      return preview;
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
            {resourceType !== 'raw' && !preview.toLowerCase().includes('.pdf') && !preview.startsWith('data:application/pdf') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Preview" className="max-h-32 rounded object-contain" />
            ) : (
              <div className="flex items-center gap-2 text-green-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10 max-w-full">
                <span className="text-xl">📄</span>
                <span className="text-sm truncate max-w-[250px] font-mono">{getDisplayName()}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">Click or drag to replace</p>
          </div>
        ) : (
          <>
            <span className="text-3xl">📁</span>
            <p className="text-sm text-gray-400 text-center">
              {multiple ? 'Click or drag multiple image files here' : 'Click or drag file here to select'}
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