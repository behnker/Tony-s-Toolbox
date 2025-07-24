'use server';

import { config } from 'dotenv';
config();

import '@/app/api/genkit/route.ts';
import '@/ai/flows/generate-tool-metadata.ts';
