
import type { Timestamp } from 'firebase/firestore';

export type Price = 'Free' | 'Freemium' | 'Paid';
export type EaseOfUse = 'Beginner' | 'Intermediate' | 'Expert';

export type Tool = {
  id: string;
  url: string;
  name: string;
  description: string;
  categories: string[];
  price: Price;
  easeOfUse: EaseOfUse;
  submittedBy?: string;
  justification?: string;
  submittedAt: Date;
  upvotes: number;
  downvotes: number;
  imageUrl?: string;
};
