export enum ReviewStatus {
  PUBLISHED = 'PUBLISHED',
  PENDING = 'PENDING',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED',
  FLAGGED = 'FLAGGED',
  SPAM = 'SPAM',
}

export enum ReviewType {
  PRODUCT = 'PRODUCT',
  VENDOR = 'VENDOR',
  ORDER = 'ORDER',
  SERVICE = 'SERVICE',
}

export enum ReviewRating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

export interface Review {
  id: string;
  type: ReviewType;
  userId: string;
  productId?: string | null;
  vendorId?: string | null;
  orderId?: string | null;
  orderItemId?: string | null;
  variantId?: string | null;
  
  // Review content
  rating: ReviewRating;
  title?: string | null;
  comment?: string | null;
  pros?: string[] | null;
  cons?: string[] | null;
  
  // Media
  images?: ReviewImage[] | null;
  videos?: ReviewVideo[] | null;
  
  // Verification
  isVerifiedPurchase: boolean;
  purchaseDate?: Date | null;
  
  // Engagement
  helpful: number;
  notHelpful: number;
  reported: number;
  
  // Status and moderation
  status: ReviewStatus;
  moderationReason?: string | null;
  moderatedBy?: string | null;
  moderatedAt?: Date | null;
  
  // Response from vendor/admin
  response?: ReviewResponse | null;
  
  // Metadata
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceInfo?: DeviceInfo | null;
  source: 'WEB' | 'MOBILE' | 'EMAIL' | 'API';
  
  // Quality metrics
  qualityScore?: number | null;
  sentimentScore?: number | null;
  language?: string | null;
  isIncentivized: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    totalReviews: number;
    averageRating: number;
    isVerified: boolean;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
  } | null;
  vendor?: {
    id: string;
    storeName: string;
    storeSlug: string;
  } | null;
  order?: {
    id: string;
    orderNumber: string;
    placedAt: Date;
  } | null;
}

export interface ReviewImage {
  id: string;
  reviewId: string;
  url: string;
  alt?: string | null;
  caption?: string | null;
  position: number;
  width?: number | null;
  height?: number | null;
  size: number; // bytes
  createdAt: Date;
}

export interface ReviewVideo {
  id: string;
  reviewId: string;
  url: string;
  thumbnail?: string | null;
  title?: string | null;
  description?: string | null;
  duration?: number | null; // seconds
  position: number;
  size: number; // bytes
  createdAt: Date;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  message: string;
  respondedBy: string;
  respondedAt: Date;
  isPublic: boolean;
  
  // Responder info
  responder: {
    id: string;
    name: string;
    role: 'VENDOR' | 'ADMIN' | 'SUPPORT';
    title?: string | null;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenResolution?: string | null;
  userAgent: string;
}

export interface ReviewHelpful {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean; // true for helpful, false for not helpful
  createdAt: Date;
}

export interface ReviewReport {
  id: string;
  reviewId: string;
  reportedBy: string;
  reason: ReviewReportReason;
  description?: string | null;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  resolution?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReviewReportReason {
  SPAM = 'SPAM',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  FAKE_REVIEW = 'FAKE_REVIEW',
  PERSONAL_INFORMATION = 'PERSONAL_INFORMATION',
  HARASSMENT = 'HARASSMENT',
  COPYRIGHT_VIOLATION = 'COPYRIGHT_VIOLATION',
  IRRELEVANT = 'IRRELEVANT',
  DUPLICATE = 'DUPLICATE',
  OTHER = 'OTHER',
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  totalHelpful: number;
  totalReported: number;
  verifiedPurchasePercentage: number;
  
  // Rating breakdown
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
  
  // Recent activity
  reviewsThisMonth: number;
  reviewsLastMonth: number;
  averageRatingTrend: number; // Positive/negative change
  
  // Quality metrics
  averageQualityScore?: number | null;
  averageSentimentScore?: number | null;
  
  // Media stats
  reviewsWithImages: number;
  reviewsWithVideos: number;
  
  // Response stats
  responseRate: number;
  averageResponseTime: number; // hours
}

export interface ReviewFilter {
  rating?: ReviewRating[] | null;
  verified?: boolean | null;
  withImages?: boolean | null;
  withVideos?: boolean | null;
  hasResponse?: boolean | null;
  language?: string | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful' | 'verified';
  status?: ReviewStatus[] | null;
}

export interface CreateReviewRequest {
  type: ReviewType;
  productId?: string;
  vendorId?: string;
  orderId?: string;
  orderItemId?: string;
  variantId?: string;
  rating: ReviewRating;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  images?: string[]; // URLs or file IDs
  videos?: string[]; // URLs or file IDs
  isAnonymous?: boolean;
}

export interface UpdateReviewRequest {
  rating?: ReviewRating;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  videos?: string[];
}

export interface ReviewModerationRequest {
  reviewId: string;
  status: ReviewStatus;
  reason?: string;
  notify?: boolean;
}

export interface ReviewResponseRequest {
  reviewId: string;
  message: string;
  isPublic?: boolean;
}

export interface ReviewInvitation {
  id: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  email: string;
  productId: string;
  vendorId: string;
  token: string;
  status: 'PENDING' | 'SENT' | 'CLICKED' | 'COMPLETED' | 'EXPIRED';
  sentAt?: Date | null;
  clickedAt?: Date | null;
  completedAt?: Date | null;
  expiresAt: Date;
  remindersSent: number;
  lastReminderAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewAnalytics {
  overview: {
    totalReviews: number;
    averageRating: number;
    responseRate: number;
    verificationRate: number;
    reportRate: number;
    helpfulRate: number;
  };
  ratingTrends: Array<{
    date: string;
    averageRating: number;
    totalReviews: number;
    verifiedReviews: number;
  }>;
  productPerformance: Array<{
    productId: string;
    productName: string;
    totalReviews: number;
    averageRating: number;
    improvementScore: number;
  }>;
  vendorPerformance: Array<{
    vendorId: string;
    storeName: string;
    totalReviews: number;
    averageRating: number;
    responseRate: number;
  }>;
  topReviewers: Array<{
    userId: string;
    userName: string;
    totalReviews: number;
    averageRating: number;
    helpfulVotes: number;
  }>;
  contentAnalysis: {
    averageWordCount: number;
    reviewsWithImages: number;
    reviewsWithVideos: number;
    sentimentDistribution: Record<string, number>;
    commonKeywords: Array<{
      word: string;
      count: number;
      sentiment: 'positive' | 'negative' | 'neutral';
    }>;
  };
  moderationStats: {
    totalReports: number;
    reportsByReason: Record<ReviewReportReason, number>;
    moderationActions: Record<ReviewStatus, number>;
    averageResolutionTime: number;
  };
}

export interface ReviewSettings {
  enableReviews: boolean;
  requireVerifiedPurchase: boolean;
  allowAnonymousReviews: boolean;
  autoApproveReviews: boolean;
  enableImageUploads: boolean;
  enableVideoUploads: boolean;
  maxImagesPerReview: number;
  maxVideosPerReview: number;
  maxImageSizeMB: number;
  maxVideoSizeMB: number;
  enableReviewInvitations: boolean;
  invitationDelayDays: number;
  maxReminders: number;
  reminderIntervalDays: number;
  enableReviewResponses: boolean;
  enableReviewModeration: boolean;
  autoHideReportedReviews: boolean;
  minimumRatingForAutoApproval: number;
  enableSentimentAnalysis: boolean;
  enableSpamDetection: boolean;
  enableReviewHelpfulness: boolean;
  enableReviewSharing: boolean;
  displayReviewsOnProducts: boolean;
  displayReviewsOnVendors: boolean;
  sortDefaultOrder: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
}

export interface ReviewTemplate {
  id: string;
  type: 'INVITATION' | 'REMINDER' | 'RESPONSE' | 'MODERATION';
  name: string;
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewExport {
  id: string;
  format: 'CSV' | 'JSON' | 'XML';
  filters: ReviewFilter;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileUrl?: string | null;
  recordCount?: number | null;
  fileSize?: number | null;
  error?: string | null;
  requestedBy: string;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface ReviewBadge {
  id: string;
  userId: string;
  type: 'TOP_REVIEWER' | 'VERIFIED_BUYER' | 'HELPFUL_REVIEWER' | 'PHOTO_REVIEWER' | 'VIDEO_REVIEWER';
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  isVisible: boolean;
}

export interface ReviewSentiment {
  reviewId: string;
  overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentimentScore: number; // -1 to 1
  emotions: Array<{
    emotion: string;
    confidence: number;
  }>;
  aspects: Array<{
    aspect: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    mentions: number;
  }>;
  keywords: Array<{
    keyword: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    importance: number;
  }>;
  processedAt: Date;
}