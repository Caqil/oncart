"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { FileUpload } from "./file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Star,
  RotateCw,
  Crop,
  Eye,
  Download,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  images?: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSize?: number;
  aspectRatio?: number;
  showPreview?: boolean;
  allowReorder?: boolean;
  allowCrop?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onUpload?: (files: File[]) => Promise<string[]>;
}

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  isMain: boolean;
  alt?: string;
}

export function ImageUpload({
  images = [],
  onImagesChange,
  maxImages = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  aspectRatio,
  showPreview = true,
  allowReorder = true,
  allowCrop = false,
  placeholder = "Upload images",
  className,
  disabled = false,
  onUpload,
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    images.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isMain: index === 0,
    }))
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesChange = async (files: File[]) => {
    if (!onUpload || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls = await onUpload(files);

      const newImages: UploadedImage[] = uploadedUrls.map((url, index) => ({
        id: `new-${Date.now()}-${index}`,
        url,
        isMain: uploadedImages.length === 0 && index === 0,
      }));

      const combined = [...uploadedImages, ...newImages];
      setUploadedImages(combined);
      onImagesChange(combined.map((img) => img.url));
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (id: string) => {
    const filtered = uploadedImages.filter((img) => img.id !== id);

    // If we removed the main image, make the first remaining image main
    if (filtered.length > 0) {
      const hasMain = filtered.some((img) => img.isMain);
      if (!hasMain) {
        filtered[0].isMain = true;
      }
    }

    setUploadedImages(filtered);
    onImagesChange(filtered.map((img) => img.url));
  };

  const setMainImage = (id: string) => {
    const updated = uploadedImages.map((img) => ({
      ...img,
      isMain: img.id === id,
    }));

    setUploadedImages(updated);
    onImagesChange(updated.map((img) => img.url));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (!allowReorder) return;

    const items = Array.from(uploadedImages);
    const [reorderedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, reorderedItem);

    setUploadedImages(items);
    onImagesChange(items.map((img) => img.url));
  };

  const canAddMore = uploadedImages.length < maxImages;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canAddMore && (
        <FileUpload
          accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
          maxSize={maxSize}
          maxFiles={maxImages - uploadedImages.length}
          multiple={true}
          disabled={disabled || isUploading}
          onFilesChange={handleFilesChange}
          showPreview={false}
        >
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-medium mb-2">{placeholder}</div>
            <p className="text-sm text-muted-foreground mb-4">
              {canAddMore
                ? `Add up to ${maxImages - uploadedImages.length} more image${maxImages - uploadedImages.length !== 1 ? "s" : ""}`
                : "Maximum images reached"}
            </p>
            <Button variant="outline" disabled={disabled || isUploading}>
              <Upload className="h-4 w-4 mr-2" />
              Choose Images
            </Button>
          </div>
        </FileUpload>
      )}

      {/* Image Grid */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Images ({uploadedImages.length}/{maxImages})
            </h4>
            {allowReorder && uploadedImages.length > 1 && (
              <p className="text-xs text-muted-foreground">Drag to reorder</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <Card
                key={image.id}
                className={cn(
                  "relative group overflow-hidden",
                  image.isMain && "ring-2 ring-primary"
                )}
              >
                <CardContent className="p-0">
                  <div
                    className={cn(
                      "relative",
                      aspectRatio ? `aspect-[${aspectRatio}]` : "aspect-square"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute top-2 right-2 flex gap-1">
                        {/* Main Image Badge */}
                        {image.isMain && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Main
                          </Badge>
                        )}

                        {/* Remove Button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                        {!image.isMain && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1 text-xs h-6"
                            onClick={() => setMainImage(image.id)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            Set Main
                          </Button>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(image.url, "_blank")}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        {allowCrop && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Crop className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
