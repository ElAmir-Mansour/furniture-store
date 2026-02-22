import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { ProcessedImage, UploadedFile } from '@/types';

// For Firebase Storage (when configured)
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { storage } from '@/lib/firebase';

const IMAGE_SIZES = [
    { name: 'thumbnail', width: 200, quality: 80 },
    { name: 'standard', width: 800, quality: 85 },
    { name: 'zoom', width: 1600, quality: 90 },
] as const;

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

export class ImageService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = UPLOAD_DIR;
        this.ensureUploadDir();
    }

    private async ensureUploadDir(): Promise<void> {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }

    // Process and save product image
    async processProductImage(file: UploadedFile): Promise<ProcessedImage> {
        const fileId = uuidv4();
        const results: Partial<ProcessedImage> = {};

        await this.ensureUploadDir();

        for (const size of IMAGE_SIZES) {
            const processedBuffer = await sharp(file.buffer)
                .resize(size.width, null, {
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: size.quality })
                .toBuffer();

            const filename = `${fileId}_${size.name}.webp`;
            const filepath = path.join(this.uploadDir, filename);

            await fs.writeFile(filepath, processedBuffer);

            (results as Record<string, string>)[size.name] = `/uploads/products/${filename}`;
        }

        return results as ProcessedImage;
    }

    // Process multiple images
    async processProductImages(files: UploadedFile[]): Promise<ProcessedImage[]> {
        return Promise.all(files.map((file) => this.processProductImage(file)));
    }

    // Delete product image
    async deleteProductImage(imageUrls: ProcessedImage): Promise<void> {
        const urls = [imageUrls.thumbnail, imageUrls.standard, imageUrls.zoom];

        for (const url of urls) {
            const filename = path.basename(url);
            const filepath = path.join(this.uploadDir, filename);

            try {
                await fs.unlink(filepath);
            } catch (error) {
                console.error(`Failed to delete image: ${filepath}`, error);
            }
        }
    }

    // Optimize existing image
    async optimizeImage(inputPath: string, outputPath: string, options?: {
        width?: number;
        quality?: number;
    }): Promise<void> {
        await sharp(inputPath)
            .resize(options?.width, null, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: options?.quality || 85 })
            .toFile(outputPath);
    }

    // Get image metadata
    async getImageMetadata(filePath: string): Promise<{
        width: number;
        height: number;
        format: string;
        size: number;
    }> {
        const metadata = await sharp(filePath).metadata();
        const stats = await fs.stat(filePath);

        return {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || 'unknown',
            size: stats.size,
        };
    }

    // Create placeholder image
    async createPlaceholder(
        width: number = 400,
        height: number = 300,
        color: string = '#f0f0f0'
    ): Promise<Buffer> {
        return sharp({
            create: {
                width,
                height,
                channels: 4,
                background: color,
            },
        })
            .webp()
            .toBuffer();
    }

    // Upload to Firebase Storage (when configured)
    async uploadToFirebase(file: UploadedFile): Promise<ProcessedImage> {
        // This will be implemented when Firebase is configured
        // For now, fall back to local storage
        return this.processProductImage(file);
    }

    // Generate responsive image srcset
    generateSrcSet(images: ProcessedImage): string {
        return [
            `${images.thumbnail} 200w`,
            `${images.standard} 800w`,
            `${images.zoom} 1600w`,
        ].join(', ');
    }
}

export const imageService = new ImageService();
export default imageService;
