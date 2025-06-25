// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  meta?: ApiMeta;
  timestamp: string;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

export interface ApiMeta {
  pagination?: Pagination;
  filters?: Record<string, any>;
  sorting?: Sorting;
  totalCount?: number;
  requestDuration?: number;
  version?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextPage?: number | null;
  previousPage?: number | null;
}

export interface Sorting {
  field: string;
  order: 'asc' | 'desc';
}

// Request Types
export interface ListRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface CreateRequest<T> {
  data: T;
  options?: {
    validate?: boolean;
    dryRun?: boolean;
    notify?: boolean;
  };
}

export interface UpdateRequest<T> {
  id: string;
  data: Partial<T>;
  options?: {
    validate?: boolean;
    merge?: boolean;
    notify?: boolean;
  };
}

export interface DeleteRequest {
  id: string;
  options?: {
    force?: boolean;
    cascade?: boolean;
    backup?: boolean;
  };
}

export interface BulkRequest<T> {
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: T[];
  options?: {
    validateAll?: boolean;
    stopOnError?: boolean;
    batchSize?: number;
    notify?: boolean;
  };
}

// Authentication & Authorization
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  secretHash: string;
  permissions: string[];
  scopes: ApiScope[];
  isActive: boolean;
  expiresAt?: Date | null;
  lastUsedAt?: Date | null;
  usageCount: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  allowedIPs?: string[] | null;
  allowedDomains?: string[] | null;
  userId?: string | null;
  vendorId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiScope {
  resource: string; // e.g., 'products', 'orders', 'users'
  actions: string[]; // e.g., ['read', 'write', 'delete']
  conditions?: Record<string, any> | null; // Additional conditions
}

export interface ApiUsage {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string | null;
  ipAddress: string;
  timestamp: Date;
  errors?: string[] | null;
}

// Rate Limiting
export interface RateLimit {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number | null;
}

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any, res: any) => void;
}

// Webhooks
export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  isActive: boolean;
  secret: string;
  headers?: Record<string, string> | null;
  retryPolicy: WebhookRetryPolicy;
  lastTriggeredAt?: Date | null;
  failureCount: number;
  successCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  name: string; // e.g., 'order.created', 'product.updated'
  description: string;
  payload: Record<string, any>; // Example payload structure
}

export interface WebhookRetryPolicy {
  maxRetries: number;
  retryDelays: number[]; // Delay in seconds for each retry
  exponentialBackoff: boolean;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  attempts: WebhookAttempt[];
  createdAt: Date;
  deliveredAt?: Date | null;
}

export interface WebhookAttempt {
  id: string;
  attempt: number;
  statusCode?: number | null;
  responseBody?: string | null;
  errorMessage?: string | null;
  duration: number; // milliseconds
  timestamp: Date;
}

// API Documentation
export interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  summary: string;
  description: string;
  tags: string[];
  parameters: ApiParameter[];
  requestBody?: ApiRequestBody | null;
  responses: Record<string, ApiResponse>;
  security: ApiSecurity[];
  examples: ApiExample[];
  deprecated: boolean;
}

export interface ApiParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description: string;
  required: boolean;
  schema: ApiSchema;
  example?: any;
}

export interface ApiRequestBody {
  description: string;
  required: boolean;
  content: Record<string, {
    schema: ApiSchema;
    examples?: Record<string, ApiExample>;
  }>;
}

export interface ApiSchema {
  type: string;
  format?: string;
  properties?: Record<string, ApiSchema>;
  items?: ApiSchema;
  required?: string[];
  example?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

export interface ApiSecurity {
  type: 'apiKey' | 'http' | 'oauth2';
  scheme?: string;
  name?: string;
  in?: 'query' | 'header' | 'cookie';
  flows?: Record<string, any>;
}

export interface ApiExample {
  summary: string;
  description?: string;
  value: any;
}

// API Analytics
export interface ApiAnalytics {
  overview: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    totalBandwidth: number;
    uniqueClients: number;
  };
  
  byEndpoint: Array<{
    endpoint: string;
    method: string;
    requests: number;
    averageResponseTime: number;
    errorRate: number;
    bandwidth: number;
  }>;
  
  byClient: Array<{
    apiKeyId: string;
    clientName: string;
    requests: number;
    bandwidth: number;
    errorRate: number;
    lastActivity: Date;
  }>;
  
  byStatusCode: Array<{
    statusCode: number;
    count: number;
    percentage: number;
  }>;
  
  timeline: Array<{
    timestamp: Date;
    requests: number;
    errors: number;
    averageResponseTime: number;
  }>;
  
  topErrors: Array<{
    error: string;
    count: number;
    endpoints: string[];
  }>;
  
  geographicDistribution: Array<{
    country: string;
    requests: number;
    percentage: number;
  }>;
}

// API Configuration
export interface ApiConfig {
  version: string;
  baseUrl: string;
  documentation: {
    title: string;
    description: string;
    version: string;
    termsOfService?: string;
    contact?: {
      name: string;
      email: string;
      url: string;
    };
    license?: {
      name: string;
      url: string;
    };
  };
  
  security: {
    enableApiKeys: boolean;
    enableRateLimit: boolean;
    enableCors: boolean;
    corsOrigins: string[];
    defaultRateLimit: RateLimitConfig;
  };
  
  features: {
    enableWebhooks: boolean;
    enableAnalytics: boolean;
    enableCaching: boolean;
    enableCompression: boolean;
    enableLogging: boolean;
  };
  
  limits: {
    maxRequestSize: number; // bytes
    maxResponseSize: number; // bytes
    requestTimeout: number; // milliseconds
    maxConcurrentRequests: number;
  };
  
  updatedAt: Date;
  updatedBy: string;
}

// SDK Generation
export interface SdkConfig {
  languages: Array<{
    language: string;
    packageName: string;
    version: string;
    author: string;
    license: string;
    repository?: string;
    homepage?: string;
  }>;
  
  features: {
    asyncSupport: boolean;
    typeAnnotations: boolean;
    errorHandling: boolean;
    retryLogic: boolean;
    logging: boolean;
  };
  
  customization: {
    clientName: string;
    namespace: string;
    userAgent: string;
    baseUrl: string;
  };
}

// API Testing
export interface ApiTest {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  parameters: Record<string, any>;
  body?: any;
  assertions: ApiAssertion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiAssertion {
  type: 'STATUS_CODE' | 'RESPONSE_TIME' | 'HEADER' | 'BODY' | 'JSON_SCHEMA';
  field?: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'matches';
  expectedValue: any;
  description: string;
}

export interface ApiTestResult {
  id: string;
  testId: string;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  responseTime: number;
  statusCode: number;
  responseBody: any;
  assertionResults: Array<{
    assertion: ApiAssertion;
    passed: boolean;
    actualValue: any;
    error?: string;
  }>;
  error?: string;
  timestamp: Date;
}

// API Monitoring
export interface ApiMonitor {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: string;
  expectedStatusCode: number;
  timeout: number; // milliseconds
  interval: number; // seconds
  isActive: boolean;
  
  // Alerting
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    uptime: number;
  };
  
  notifications: {
    email: string[];
    slack?: string;
    webhook?: string;
  };
  
  // Status
  status: 'UP' | 'DOWN' | 'DEGRADED';
  lastCheck: Date;
  uptime: number; // percentage
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiMonitorResult {
  id: string;
  monitorId: string;
  status: 'SUCCESS' | 'FAILURE' | 'TIMEOUT';
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: Date;
}

// API Versioning
export interface ApiVersion {
  version: string;
  isActive: boolean;
  isDeprecated: boolean;
  deprecationDate?: Date | null;
  sunsetDate?: Date | null;
  changeLog: string;
  migrationGuide?: string;
  documentation: string;
  supportedUntil?: Date | null;
  createdAt: Date;
}

// Error Handling
export interface ApiErrorHandler {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: Record<string, any>;
  userMessage?: string; // User-friendly message
  retryable: boolean;
  category: 'CLIENT_ERROR' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR';
}

// API Cache
export interface ApiCache {
  key: string;
  endpoint: string;
  method: string;
  parameters: Record<string, any>;
  response: any;
  ttl: number; // seconds
  createdAt: Date;
  expiresAt: Date;
  hitCount: number;
}

// Batch Operations
export interface BatchOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  items: Array<{
    id?: string;
    data: any;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    error?: string;
  }>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number; // 0-100
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

// API Client Configuration
export interface ApiClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  userAgent: string;
  headers: Record<string, string>;
  enableLogging: boolean;
  enableMetrics: boolean;
}