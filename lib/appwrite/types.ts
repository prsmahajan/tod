// Appwrite Document Types

export interface Transaction {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  type: 'one-time' | 'subscription';
  status: 'success' | 'failed' | 'pending';
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySubscriptionId?: string;
  planType: 'seedling' | 'sprout' | 'tree';
  billingCycle?: 'weekly' | 'monthly';
}

export interface Subscription {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  razorpaySubscriptionId: string;
  planId: string;
  planType: 'seedling' | 'sprout' | 'tree';
  billingCycle: 'weekly' | 'monthly';
  amount: number;
  status: 'created' | 'authenticated' | 'active' | 'paused' | 'cancelled' | 'halted' | 'expired';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  nextChargeAt?: string;
}

export interface UserPhoto {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  imageIds: string[];
  description: string;
  location?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedDate: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  animalCount?: number;
  featured: boolean;
}

export interface Article {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImageId?: string;
  authorId: string;
  authorName: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: string;
  tags?: string[];
  views: number;
}

export interface AnimalFed {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  photoId: string;
  userId: string;
  userName: string;
  feedDate: string;
  animalCount?: number;
  location: string;
  imageUrl: string;
  featured: boolean;
}

// Razorpay Plan Types
export interface RazorpayPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: 'weekly' | 'monthly';
  planType: 'seedling' | 'sprout' | 'tree';
}

// Dashboard Stats
export interface UserStats {
  totalContributed: number;
  transactionCount: number;
  photosSubmitted: number;
  photosApproved: number;
  activeSubscription?: Subscription;
}
