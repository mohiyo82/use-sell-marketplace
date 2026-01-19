import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import * as crypto from 'crypto';

@Injectable()
export class CloudinaryService {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
    this.apiKey = process.env.CLOUDINARY_API_KEY || '';
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || '';

    // Verify credentials are loaded
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      console.warn('⚠️ Cloudinary credentials not fully configured:', {
        cloud_name: this.cloudName ? '✓' : '✗',
        api_key: this.apiKey ? '✓' : '✗',
        api_secret: this.apiSecret ? '✓' : '✗',
      });
    } else {
      console.log('✅ Cloudinary credentials loaded successfully');
    }

    // Configure cloudinary
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    });
  }

  /**
   * Generate Cloudinary upload signature for frontend uploads
   * 
   * The string to sign must contain ALL upload parameters in alphabetical order,
   * followed by the API_SECRET, then hashed with SHA1
   */
  generateSignature(timestamp: number, folder: string = 'use-and-sell/products') {
    const params: Record<string, string | number> = {
      folder,
      timestamp,
    };

    // Create string to sign: all params in alphabetical order, joined with &
    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join('&') + this.apiSecret;

    // SHA1 hash
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    return { 
      signature, 
      apiKey: this.apiKey, 
      cloudName: this.cloudName,
      timestamp,
      folder,
    };
  }

  getCloudName(): string {
    return this.cloudName;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'use-and-sell/products',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        },
      );

      Readable.from(file.buffer).pipe(stream);
    });
  }

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
