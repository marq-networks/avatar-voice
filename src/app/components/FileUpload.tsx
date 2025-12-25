import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';

interface FileUploadProps {
  maxFiles: number;
  acceptedFormats: string[];
  onFilesChange: (files: File[]) => void;
  label: string;
  value?: File[];
}

export function FileUpload({ maxFiles, acceptedFormats, onFilesChange, label, value = [] }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>(value);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, maxFiles - files.length);
    const newFiles = [...files, ...droppedFiles];
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [files, maxFiles, onFilesChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, maxFiles - files.length);
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      onFilesChange(newFiles);
    }
  }, [files, maxFiles, onFilesChange]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [files, onFilesChange]);

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-700">{label}</label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload className="mx-auto mb-4 text-gray-400" size={32} />
        <p className="text-sm text-gray-600 mb-2">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Max {maxFiles} files • {acceptedFormats.join(', ').toUpperCase()}
        </p>
        <input
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${label.replace(/\s/g, '-')}`}
          disabled={files.length >= maxFiles}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById(`file-upload-${label.replace(/\s/g, '-')}`)?.click()}
          disabled={files.length >= maxFiles}
        >
          Choose Files
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 truncate">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
