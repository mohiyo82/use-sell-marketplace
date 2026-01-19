import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env file explicitly
config({ path: resolve(__dirname, '../../.env') });

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary;
  },
};
