"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  X,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  AlertCircle,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "./loading-spinner";

interface FileUploadProps {
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  onFilesChange: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
  className?: string;
  children?: React.ReactNode;
  showPreview?: boolean;
  uploadProgress?: Record<string, number>;
}

interface UploadedFile {
  file: File;
  preview?: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  url?: string;
}

export function FileUpload({
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "text/*": [".txt", ".csv"],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  multiple = true,
  disabled = false,
  onFilesChange,
  onUpload,
  className,
  children,
  showPreview = true,
  uploadProgress,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (disabled) return;

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejection) => {
          console.error(
            "File rejected:",
            rejection.file.name,
            rejection.errors
          );
        });
      }

      // Add accepted files
      const newFiles = acceptedFiles.map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        status: "pending" as const,
        progress: 0,
      }));

      setUploadedFiles((prev) => {
        const combined = [...prev, ...newFiles];
        const files = combined.map((f) => f.file);
        onFilesChange(files);
        return combined;
      });
    },
    [disabled, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled,
  });

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      const files = newFiles.map((f) => f.file);
      onFilesChange(files);

      // Revoke object URL to prevent memory leaks
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview!);
      }

      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (!onUpload || isUploading) return;

    setIsUploading(true);
    try {
      const files = uploadedFiles.map((f) => f.file);
      await onUpload(files);

      setUploadedFiles((prev) =>
        prev.map((file) => ({ ...file, status: "success", progress: 100 }))
      );
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        }))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Video;
    if (type.startsWith("audio/")) return Music;
    if (type.includes("pdf")) return FileText;
    if (type.includes("zip") || type.includes("rar")) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          "hover:border-primary hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} ref={fileInputRef} />

        {children ? (
          children
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-medium mb-2">
              {isDragActive ? "Drop files here" : "Upload files"}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to select files
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Accepted: {Object.values(accept).flat().join(", ")}</p>
              <p>Max size: {formatFileSize(maxSize)} per file</p>
              {maxFiles > 1 && <p>Max files: {maxFiles}</p>}
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Selected Files ({uploadedFiles.length})
            </h4>
            {onUpload && (
              <Button
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  uploadedFiles.every((f) => f.status !== "pending")
                }
                size="sm"
              >
                {isUploading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile, index) => {
              const FileIcon = getFileIcon(uploadedFile.file);
              const progress =
                uploadProgress?.[uploadedFile.file.name] ??
                uploadedFile.progress;

              return (
                <Card key={index} className="p-3">
                  <div className="flex items-center space-x-3">
                    {/* Preview/Icon */}
                    <div className="flex-shrink-0">
                      {showPreview && uploadedFile.preview ? (
                        <img
                          src={uploadedFile.preview}
                          alt={uploadedFile.file.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                          <FileIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>

                      {/* Progress */}
                      {uploadedFile.status === "uploading" && (
                        <div className="mt-1">
                          <Progress value={progress} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {progress}% uploaded
                          </p>
                        </div>
                      )}

                      {uploadedFile.status === "error" && (
                        <p className="text-xs text-destructive mt-1">
                          {uploadedFile.error}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === "success" && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                      )}
                      {uploadedFile.status === "error" && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                      {uploadedFile.status === "uploading" && (
                        <Badge variant="secondary">
                          <LoadingSpinner size="small" />
                          Uploading
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={uploadedFile.status === "uploading"}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
