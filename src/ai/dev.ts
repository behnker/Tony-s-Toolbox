import { config } from 'dotenv';
config();

import '@/ai/flows/extract-metadata.ts';
import '@/ai/flows/generate-short-description.ts';
import '@/ai/flows/extract-image-from-url.ts';
import '@/ai/flows/generate-metadata.ts';
