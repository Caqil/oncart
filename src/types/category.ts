export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  banner?: string | null;
  icon?: string | null;
  parentId?: string | null;
  position: number;
  level: number; // 0 for root categories, 1 for first level, etc.
  isActive: boolean;
  isFeatured: boolean;
  
  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  canonicalUrl?: string | null;
  
  // Display settings
  displaySettings: CategoryDisplaySettings;
  
  // Commission (for marketplace)
  commissionRate?: number | null;
  
  // Attributes and filters
  attributes: CategoryAttribute[];
  filterOptions: CategoryFilterOption[];
  
  // Path for breadcrumbs
  path: string; // e.g., "electronics/phones/smartphones"
  breadcrumbs: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  parent?: Category | null;
  children: Category[];
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image?: string | null;
  }> | null;
  
  // Computed fields
  productCount: number;
  activeProductCount: number;
  totalProductCount: number; // Including subcategories
  hasChildren: boolean;
  depth: number;
}

export interface CategoryDisplaySettings {
  showProductCount: boolean;
  showSubcategories: boolean;
  showDescription: boolean;
  showBanner: boolean;
  productsPerPage: number;
  defaultSortOrder: 'name' | 'price_low' | 'price_high' | 'newest' | 'popular' | 'rating';
  layoutType: 'grid' | 'list' | 'masonry';
  enableFilters: boolean;
  enableSearch: boolean;
  enableSorting: boolean;
  enablePagination: boolean;
  showBreadcrumbs: boolean;
  customCSS?: string | null;
  headerTemplate?: string | null;
  footerTemplate?: string | null;
}

export interface CategoryAttribute {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  type: AttributeType;
  isRequired: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  isVariant: boolean; // Can be used for product variants
  position: number;
  
  // Display settings
  displayName?: string | null;
  description?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  
  // Validation
  validation?: AttributeValidation | null;
  
  // Options (for select, multiselect, radio)
  options: AttributeOption[];
  
  createdAt: Date;
  updatedAt: Date;
}

export enum AttributeType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  DECIMAL = 'DECIMAL',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  COLOR = 'COLOR',
  URL = 'URL',
  EMAIL = 'EMAIL',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
}

export interface AttributeValidation {
  minLength?: number | null;
  maxLength?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  pattern?: string | null; // Regex pattern
  allowedFileTypes?: string[] | null;
  maxFileSize?: number | null; // in bytes
  required?: boolean | null;
}

export interface AttributeOption {
  id: string;
  attributeId: string;
  value: string;
  label: string;
  position: number;
  isActive: boolean;
  
  // Visual attributes
  color?: string | null;
  image?: string | null;
  
  // Metadata
  metadata?: Record<string, any> | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFilterOption {
  id: string;
  categoryId: string;
  type: FilterType;
  name: string;
  slug: string;
  isActive: boolean;
  position: number;
  
  // Display settings
  displayName?: string | null;
  description?: string | null;
  
  // Filter configuration
  configuration: FilterConfiguration;
  
  createdAt: Date;
  updatedAt: Date;
}

export enum FilterType {
  PRICE_RANGE = 'PRICE_RANGE',
  RATING = 'RATING',
  BRAND = 'BRAND',
  COLOR = 'COLOR',
  SIZE = 'SIZE',
  MATERIAL = 'MATERIAL',
  AVAILABILITY = 'AVAILABILITY',
  SHIPPING = 'SHIPPING',
  DISCOUNT = 'DISCOUNT',
  ATTRIBUTE = 'ATTRIBUTE',
  CUSTOM = 'CUSTOM',
}

export interface FilterConfiguration {
  // Price range filter
  priceRange?: {
    min: number;
    max: number;
    step: number;
    currency: string;
  } | null;
  
  // Rating filter
  rating?: {
    minRating: number;
    maxRating: number;
    allowHalfStars: boolean;
  } | null;
  
  // Multi-select filters (brand, color, etc.)
  options?: Array<{
    value: string;
    label: string;
    count?: number | null;
    color?: string | null;
    image?: string | null;
  }> | null;
  
  // Attribute filter
  attributeId?: string | null;
  
  // Custom filter
  customQuery?: string | null;
}

export interface CategoryTree {
  id: string;
  name: string;
  slug: string;
  level: number;
  productCount: number;
  children: CategoryTree[];
  isActive: boolean;
  position: number;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  banner?: string;
  icon?: string;
  parentId?: string;
  position?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  displaySettings?: Partial<CategoryDisplaySettings>;
  commissionRate?: number;
  attributes?: CreateCategoryAttributeRequest[];
}

export interface CreateCategoryAttributeRequest {
  name: string;
  type: AttributeType;
  isRequired?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
  isVariant?: boolean;
  position?: number;
  displayName?: string;
  description?: string;
  placeholder?: string;
  helpText?: string;
  validation?: AttributeValidation;
  options?: Array<{
    value: string;
    label: string;
    color?: string;
    image?: string;
  }>;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}

export interface CategoryListFilters {
  parentId?: string | null;
  level?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  hasProducts?: boolean;
  sortBy?: 'name' | 'position' | 'productCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryAnalytics {
  overview: {
    totalCategories: number;
    activeCategories: number;
    featuredCategories: number;
    categoriesWithProducts: number;
    averageProductsPerCategory: number;
    maxDepth: number;
  };
  topCategories: Array<{
    categoryId: string;
    name: string;
    productCount: number;
    totalViews: number;
    totalSales: number;
    conversionRate: number;
  }>;
  categoryPerformance: Array<{
    categoryId: string;
    name: string;
    level: number;
    views: number;
    products: number;
    sales: number;
    revenue: number;
    conversionRate: number;
    bounceRate: number;
  }>;
  trendingCategories: Array<{
    categoryId: string;
    name: string;
    growthRate: number;
    currentPeriodViews: number;
    previousPeriodViews: number;
  }>;
  categoryHierarchy: CategoryTree[];
  usageStats: {
    categoriesWithImages: number;
    categoriesWithDescriptions: number;
    categoriesWithSEO: number;
    categoriesWithCustomAttributes: number;
  };
}

export interface CategorySuggestion {
  id: string;
  name: string;
  confidence: number;
  reason: 'SIMILAR_PRODUCTS' | 'TEXT_ANALYSIS' | 'USER_BEHAVIOR' | 'MANUAL_SUGGESTION';
  metadata?: Record<string, any> | null;
}

export interface CategoryMapping {
  id: string;
  externalCategoryId: string;
  externalCategoryName: string;
  internalCategoryId: string;
  source: string; // e.g., 'google_shopping', 'amazon', 'facebook'
  confidence: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTemplate {
  id: string;
  name: string;
  description?: string | null;
  industry: string;
  categoryStructure: Array<{
    name: string;
    slug: string;
    children?: Array<{
      name: string;
      slug: string;
      children?: Array<{
        name: string;
        slug: string;
      }>;
    }>;
  }>;
  attributes: CreateCategoryAttributeRequest[];
  filterOptions: Array<{
    type: FilterType;
    name: string;
    configuration: FilterConfiguration;
  }>;
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryImport {
  id: string;
  fileName: string;
  fileSize: number;
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value: string;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
    value: string;
  }>;
  progress: number; // 0-100
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryExport {
  id: string;
  format: 'CSV' | 'JSON' | 'XML';
  includeProducts: boolean;
  includeAttributes: boolean;
  filters: CategoryListFilters;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  fileUrl?: string | null;
  recordCount?: number | null;
  fileSize?: number | null;
  error?: string | null;
  requestedBy: string;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface CategoryBulkOperation {
  id: string;
  operation: 'UPDATE' | 'DELETE' | 'MOVE' | 'ACTIVATE' | 'DEACTIVATE';
  categoryIds: string[];
  data?: Record<string, any> | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number; // 0-100
  processedCount: number;
  successCount: number;
  failureCount: number;
  errors: Array<{
    categoryId: string;
    error: string;
  }>;
  requestedBy: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategorySEOAnalysis {
  categoryId: string;
  score: number; // 0-100
  issues: Array<{
    type: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
    field: string;
    suggestion?: string | null;
  }>;
  recommendations: string[];
  metaAnalysis: {
    titleLength: number;
    descriptionLength: number;
    keywordDensity: Record<string, number>;
    hasUniqueTitle: boolean;
    hasUniqueDescription: boolean;
  };
  contentAnalysis: {
    wordCount: number;
    readabilityScore: number;
    hasHeadings: boolean;
    imageCount: number;
    hasAltText: boolean;
  };
  analyzedAt: Date;
}