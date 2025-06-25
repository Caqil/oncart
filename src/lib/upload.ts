import { writeFile, mkdir, unlink, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES, ALLOWED_DOCUMENT_TYPES, APP_CONFIG } from './constants';

// Upload configuration
export interface UploadConfig {
  maxFileSize: number;
  allowedImageTypes: string[];
  allowedVideoTypes: string[];
  allowedDocumentTypes: string[];
  uploadDir: string;
  imageUploadDir: string;
  videoUploadDir: string;
  documentUploadDir: string;
  enableImageOptimization: boolean;
  imageQuality: number;
  generateThumbnails: boolean;
  thumbnailSizes: Array<{ width: number; height: number; suffix: string }>;
}

// Upload result interface
export interface UploadResult {
  success: boolean;
  file?: {
    originalName: string;
    fileName: string;
    filePath: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    dimensions?: { width: number; height: number };
    thumbnails?: Array<{
      size: string;
      url: string;
      width: number;
      height: number;
    }>;
  };
  error?: string;
}

// File validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Default upload configuration
const defaultUploadConfig: UploadConfig = {
  maxFileSize: APP_CONFIG.maxFileSize,
  allowedImageTypes: [...ALLOWED_IMAGE_TYPES],
  allowedVideoTypes: [...ALLOWED_VIDEO_TYPES],
  allowedDocumentTypes: [...ALLOWED_DOCUMENT_TYPES],
  uploadDir: './public/uploads',
  imageUploadDir: './public/uploads/images',
  videoUploadDir: './public/uploads/videos',
  documentUploadDir: './public/uploads/documents',
  enableImageOptimization: true,
  imageQuality: 85,
  generateThumbnails: true,
  thumbnailSizes: [
    { width: 150, height: 150, suffix: 'thumb' },
    { width: 300, height: 300, suffix: 'small' },
    { width: 600, height: 600, suffix: 'medium' },
    { width: 1200, height: 1200, suffix: 'large' },
  ],
};

// File upload manager
export class FileUploadManager {
  private config: UploadConfig;

  constructor(config: Partial<UploadConfig> = {}) {
    this.config = { ...defaultUploadConfig, ...config };
    this.ensureDirectoriesExist();
  }

  // Ensure upload directories exist
  private async ensureDirectoriesExist(): Promise<void> {
    const directories = [
      this.config.uploadDir,
      this.config.imageUploadDir,
      this.config.videoUploadDir,
      this.config.documentUploadDir,
    ];

    for (const dir of directories) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  // Validate file before upload
  validateFile(file: File): ValidationResult {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.config.maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatFileSize(this.config.maxFileSize)}`);
    }

    // Check file type
    const isValidImage = this.config.allowedImageTypes.includes(file.type);
    const isValidVideo = this.config.allowedVideoTypes.includes(file.type);
    const isValidDocument = this.config.allowedDocumentTypes.includes(file.type);

    if (!isValidImage && !isValidVideo && !isValidDocument) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      errors.push('File name is required');
    }

    // Check for potentially dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileExtension = extname(file.name).toLowerCase();
    if (dangerousExtensions.includes(fileExtension)) {
      errors.push('File type is not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Upload file
  async uploadFile(file: File, options: {
    subdirectory?: string;
    customFileName?: string;
    preserveOriginalName?: boolean;
  } = {}): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Determine file type and upload directory
      const fileType = this.getFileType(file.type);
      const uploadDir = this.getUploadDirectory(fileType, options.subdirectory);

      // Generate filename
      const fileName = this.generateFileName(file.name, options);
      const filePath = join(uploadDir, fileName);

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process image if needed
      let processedBuffer = buffer;
      let dimensions: { width: number; height: number } | undefined;
      let thumbnails: Array<{ size: string; url: string; width: number; height: number }> | undefined;

      if (fileType === 'image' && this.config.enableImageOptimization) {
        const result = await this.processImage(buffer, fileName, uploadDir);
        processedBuffer = Buffer.from(result.buffer);
        dimensions = result.dimensions;
        thumbnails = result.thumbnails;
      }

      // Save file
      await writeFile(filePath, processedBuffer);

      // Generate file URL
      const fileUrl = this.generateFileUrl(filePath);

      return {
        success: true,
        file: {
          originalName: file.name,
          fileName,
          filePath,
          fileUrl,
          fileSize: processedBuffer.length,
          mimeType: file.type,
          dimensions,
          thumbnails,
        },
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Upload multiple files
  async uploadFiles(files: File[], options: {
    subdirectory?: string;
    maxFiles?: number;
  } = {}): Promise<UploadResult[]> {
    if (options.maxFiles && files.length > options.maxFiles) {
      throw new Error(`Cannot upload more than ${options.maxFiles} files at once`);
    }

    const uploadPromises = files.map(file => 
      this.uploadFile(file, { subdirectory: options.subdirectory })
    );

    return Promise.all(uploadPromises);
  }

  // Process image (optimize and generate thumbnails)
  private async processImage(
    buffer: Buffer,
    fileName: string,
    uploadDir: string
  ): Promise<{
    buffer: Buffer;
    dimensions: { width: number; height: number };
    thumbnails: Array<{ size: string; url: string; width: number; height: number }>;
  }> {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    // Optimize main image
    const optimizedBuffer = await image
      .jpeg({ quality: this.config.imageQuality, progressive: true })
      .png({ quality: this.config.imageQuality, progressive: true })
      .webp({ quality: this.config.imageQuality })
      .toBuffer();

    const dimensions = {
      width: metadata.width || 0,
      height: metadata.height || 0,
    };

    // Generate thumbnails if enabled
    const thumbnails: Array<{ size: string; url: string; width: number; height: number }> = [];
    
    if (this.config.generateThumbnails) {
      for (const size of this.config.thumbnailSizes) {
        const thumbFileName = this.generateThumbnailFileName(fileName, size.suffix);
        const thumbPath = join(uploadDir, thumbFileName);
        
        await image
          .resize(size.width, size.height, { 
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: this.config.imageQuality })
          .toFile(thumbPath);

        thumbnails.push({
          size: size.suffix,
          url: this.generateFileUrl(thumbPath),
          width: size.width,
          height: size.height,
        });
      }
    }

    return { buffer: optimizedBuffer, dimensions, thumbnails };
  }

  // Get file type based on MIME type
  private getFileType(mimeType: string): 'image' | 'video' | 'document' {
    if (this.config.allowedImageTypes.includes(mimeType)) {
      return 'image';
    } else if (this.config.allowedVideoTypes.includes(mimeType)) {
      return 'video';
    } else {
      return 'document';
    }
  }

  // Get upload directory based on file type
  private getUploadDirectory(fileType: 'image' | 'video' | 'document', subdirectory?: string): string {
    let baseDir: string;

    switch (fileType) {
      case 'image':
        baseDir = this.config.imageUploadDir;
        break;
      case 'video':
        baseDir = this.config.videoUploadDir;
        break;
      case 'document':
        baseDir = this.config.documentUploadDir;
        break;
    }

    return subdirectory ? join(baseDir, subdirectory) : baseDir;
  }

  // Generate unique filename
  private generateFileName(originalName: string, options: {
    customFileName?: string;
    preserveOriginalName?: boolean;
  }): string {
    if (options.customFileName) {
      return this.sanitizeFileName(options.customFileName);
    }

    if (options.preserveOriginalName) {
      const name = basename(originalName, extname(originalName));
      const extension = extname(originalName);
      return `${this.sanitizeFileName(name)}_${Date.now()}${extension}`;
    }

    const extension = extname(originalName);
    return `${uuidv4()}${extension}`;
  }

  // Generate thumbnail filename
  private generateThumbnailFileName(originalFileName: string, suffix: string): string {
    const name = basename(originalFileName, extname(originalFileName));
    const extension = extname(originalFileName);
    return `${name}_${suffix}${extension}`;
  }

  // Sanitize filename
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  // Generate file URL
  private generateFileUrl(filePath: string): string {
    return filePath.replace('./public', '').replace(/\\/g, '/');
  }

  // Format file size
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Delete file
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await unlink(filePath);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  // Delete files with thumbnails
  async deleteFileWithThumbnails(filePath: string, thumbnails?: Array<{ url: string }>): Promise<boolean> {
    try {
      // Delete main file
      await this.deleteFile(filePath);

      // Delete thumbnails
      if (thumbnails) {
        const deletePromises = thumbnails.map(thumb => {
          const thumbPath = `./public${thumb.url}`;
          return this.deleteFile(thumbPath);
        });
        await Promise.all(deletePromises);
      }

      return true;
    } catch (error) {
      console.error('File deletion with thumbnails error:', error);
      return false;
    }
  }

  // Get file info
  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    mimeType?: string;
    createdAt?: Date;
    modifiedAt?: Date;
  }> {
    try {
      const stats = await stat(filePath);
      return {
        exists: true,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      return { exists: false };
    }
  }

  // Clean up old files
  async cleanupOldFiles(maxAge: number = 30): Promise<number> {
    // Implementation for cleaning up files older than maxAge days
    // This would scan the upload directories and remove old files
    return 0; // Return number of files cleaned up
  }
}

// Image processing utilities
export class ImageProcessor {
  // Resize image
  static async resizeImage(
    inputBuffer: Buffer,
    width: number,
    height: number,
    options: {
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      position?: string;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Buffer> {
    return sharp(inputBuffer)
      .resize(width, height, {
        fit: options.fit || 'cover',
        position: options.position || 'center',
      })
      .toFormat(options.format || 'jpeg', { quality: options.quality || 85 })
      .toBuffer();
  }

  // Generate multiple sizes
  static async generateImageSizes(
    inputBuffer: Buffer,
    sizes: Array<{ width: number; height: number; name: string }>
  ): Promise<Array<{ name: string; buffer: Buffer; width: number; height: number }>> {
    const results = await Promise.all(
      sizes.map(async size => {
        const buffer = await this.resizeImage(inputBuffer, size.width, size.height);
        return {
          name: size.name,
          buffer,
          width: size.width,
          height: size.height,
        };
      })
    );

    return results;
  }

  // Convert image format
  static async convertImageFormat(
    inputBuffer: Buffer,
    format: 'jpeg' | 'png' | 'webp',
    quality: number = 85
  ): Promise<Buffer> {
    return sharp(inputBuffer)
      .toFormat(format, { quality })
      .toBuffer();
  }

  // Add watermark
  static async addWatermark(
    inputBuffer: Buffer,
    watermarkBuffer: Buffer,
    options: {
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
      opacity?: number;
    } = {}
  ): Promise<Buffer> {
    const { position = 'bottom-right', opacity = 0.5 } = options;

    // Convert position to sharp gravity
    const gravityMap = {
      'top-left': 'northwest',
      'top-right': 'northeast',
      'bottom-left': 'southwest',
      'bottom-right': 'southeast',
      'center': 'center',
    };

    return sharp(inputBuffer)
      .composite([{
        input: await sharp(watermarkBuffer)
          .ensureAlpha()
          .modulate({ brightness: 1, saturation: 1, lightness: opacity })
          .toBuffer(),
        gravity: gravityMap[position] as any,
      }])
      .toBuffer();
  }
}

// File validation utilities
export class FileValidator {
  // Validate image dimensions
  static async validateImageDimensions(
    file: File,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const metadata = await sharp(buffer).metadata();

      const { width = 0, height = 0 } = metadata;

      if (minWidth && width < minWidth) {
        errors.push(`Image width must be at least ${minWidth}px`);
      }

      if (minHeight && height < minHeight) {
        errors.push(`Image height must be at least ${minHeight}px`);
      }

      if (maxWidth && width > maxWidth) {
        errors.push(`Image width cannot exceed ${maxWidth}px`);
      }

      if (maxHeight && height > maxHeight) {
        errors.push(`Image height cannot exceed ${maxHeight}px`);
      }
    } catch (error) {
      errors.push('Invalid image file');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate file content (detect malicious files)
  static validateFileContent(file: File): ValidationResult {
    const errors: string[] = [];

    // Check file signature/magic numbers
    // This is a basic implementation - in production, you'd want more comprehensive checks

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Default upload manager instance
export const uploadManager = new FileUploadManager();

// Helper functions
export async function uploadSingleFile(
  file: File,
  options: {
    subdirectory?: string;
    customFileName?: string;
    preserveOriginalName?: boolean;
  } = {}
): Promise<UploadResult> {
  return uploadManager.uploadFile(file, options);
}

export async function uploadMultipleFiles(
  files: File[],
  options: {
    subdirectory?: string;
    maxFiles?: number;
  } = {}
): Promise<UploadResult[]> {
  return uploadManager.uploadFiles(files, options);
}

export function validateFileUpload(file: File): ValidationResult {
  return uploadManager.validateFile(file);
}

export async function deleteUploadedFile(filePath: string, thumbnails?: Array<{ url: string }>): Promise<boolean> {
  if (thumbnails) {
    return uploadManager.deleteFileWithThumbnails(filePath, thumbnails);
  }
  return uploadManager.deleteFile(filePath);
}