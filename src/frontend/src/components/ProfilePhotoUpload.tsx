import { useState, useRef, DragEvent } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ExternalBlob } from '../backend';

interface ProfilePhotoUploadProps {
  onUpload: (blobUrl: string) => void;
  currentPhotoUrl?: string;
}

export default function ProfilePhotoUpload({ onUpload, currentPhotoUrl }: ProfilePhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (JPG, PNG, GIF, or WebP)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const handleFile = async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const blobUrl = blob.getDirectURL();
      onUpload(blobUrl);
      setIsUploading(false);
      setUploadProgress(0);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-dashed border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          {preview ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-square max-w-xs mx-auto rounded-lg overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
                {!isUploading && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleClearPreview}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading... {uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                {isDragging ? (
                  <Upload className="w-8 h-8 text-primary" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-primary" />
                )}
              </div>
              <p className="text-sm font-medium mb-2">
                {isDragging ? 'Drop your image here' : 'Drag and drop your profile photo'}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                or click to browse (JPG, PNG, GIF, WebP - Max 5MB)
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleBrowseClick}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
