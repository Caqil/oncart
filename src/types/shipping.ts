export enum ShippingProvider {
  FEDEX = 'FEDEX',
  UPS = 'UPS',
  DHL = 'DHL',
  USPS = 'USPS',
  ROYAL_MAIL = 'ROYAL_MAIL',
  CANADA_POST = 'CANADA_POST',
  AUSTRALIA_POST = 'AUSTRALIA_POST',
  LOCAL_COURIER = 'LOCAL_COURIER',
  CUSTOM = 'CUSTOM',
}

export enum ShippingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED_DELIVERY = 'FAILED_DELIVERY',
  RETURNED = 'RETURNED',
  CANCELLED = 'CANCELLED',
  EXCEPTION = 'EXCEPTION',
}

export enum PackageType {
  ENVELOPE = 'ENVELOPE',
  BOX = 'BOX',
  TUBE = 'TUBE',
  PAK = 'PAK',
  CUSTOM = 'CUSTOM',
}

export enum WeightUnit {
  KG = 'KG',
  LB = 'LB',
  G = 'G',
  OZ = 'OZ',
}

export enum DimensionUnit {
  CM = 'CM',
  IN = 'IN',
  M = 'M',
  FT = 'FT',
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string | null;
  provider: ShippingProvider;
  serviceCode: string;
  isActive: boolean;
  
  // Pricing
  baseRate: number;
  perKgRate?: number | null;
  perItemRate?: number | null;
  freeShippingThreshold?: number | null;
  
  // Delivery estimates
  estimatedDays: {
    min: number;
    max: number;
  };
  
  // Availability
  availableCountries: string[];
  availableRegions?: string[] | null;
  excludedPostalCodes?: string[] | null;
  
  // Restrictions
  maxWeight?: number | null;
  maxDimensions?: ShippingDimensions | null;
  maxValue?: number | null;
  requiresSignature: boolean;
  supportsInsurance: boolean;
  supportsTracking: boolean;
  
  // Features
  features: ShippingFeature[];
  
  // Settings
  settings: ShippingMethodSettings;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingDimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface ShippingFeature {
  code: string;
  name: string;
  description?: string | null;
  additionalCost?: number | null;
}

export interface ShippingMethodSettings {
  autoCalculateRates: boolean;
  includeInsurance: boolean;
  defaultInsuranceValue?: number | null;
  requiresSignature: boolean;
  enableTracking: boolean;
  packingSlipRequired: boolean;
  customsDeclarationRequired: boolean;
  dropoffLocation?: string | null;
  pickupSchedule?: PickupSchedule | null;
}

export interface PickupSchedule {
  isEnabled: boolean;
  cutoffTime: string; // HH:mm format
  sameDay: boolean;
  nextDay: boolean;
  weekendsIncluded: boolean;
  holidays: string[]; // Date strings
}

export interface Shipment {
  id: string;
  orderId: string;
  vendorId?: string | null;
  shipmentNumber: string;
  status: ShippingStatus;
  
  // Method and provider
  shippingMethodId: string;
  provider: ShippingProvider;
  serviceCode: string;
  
  // Tracking
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  labelUrl?: string | null;
  
  // Addresses
  fromAddress: ShippingAddress;
  toAddress: ShippingAddress;
  returnAddress?: ShippingAddress | null;
  
  // Package details
  packages: ShipmentPackage[];
  totalWeight: number;
  weightUnit: WeightUnit;
  
  // Costs
  shippingCost: number;
  insuranceCost: number;
  additionalFees: number;
  totalCost: number;
  currency: string;
  
  // Delivery
  estimatedDelivery?: Date | null;
  actualDelivery?: Date | null;
  deliveryAttempts: number;
  signatureRequired: boolean;
  deliveryInstructions?: string | null;
  
  // Insurance
  insuranceAmount?: number | null;
  insuranceProvider?: string | null;
  
  // Customs (for international shipments)
  customsDeclaration?: CustomsDeclaration | null;
  
  // Events and tracking
  events: ShipmentEvent[];
  
  // Metadata
  metadata?: Record<string, any> | null;
  notes?: string | null;
  
  // Timestamps
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  order: {
    id: string;
    orderNumber: string;
  };
  vendor?: {
    id: string;
    storeName: string;
  } | null;
  shippingMethod: {
    id: string;
    name: string;
    provider: ShippingProvider;
  };
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string | null;
  email?: string | null;
  
  // Delivery preferences
  isResidential?: boolean | null;
  deliveryInstructions?: string | null;
  accessCode?: string | null;
  
  // Coordinates (for route optimization)
  coordinates?: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface ShipmentPackage {
  id: string;
  shipmentId: string;
  
  // Package details
  type: PackageType;
  weight: number;
  weightUnit: WeightUnit;
  dimensions: ShippingDimensions;
  
  // Contents
  items: PackageItem[];
  declaredValue: number;
  description?: string | null;
  
  // Package-specific tracking
  trackingNumber?: string | null;
  
  // Restrictions
  isFragile: boolean;
  isHazardous: boolean;
  requiresRefrigeration: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageItem {
  orderItemId: string;
  productId: string;
  variantId?: string | null;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight: number;
  hsCode?: string | null; // Harmonized System code for customs
  countryOfOrigin?: string | null;
}

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: ShippingStatus;
  description: string;
  location?: string | null;
  timestamp: Date;
  
  // Provider-specific data
  providerStatus?: string | null;
  providerDescription?: string | null;
  
  // Internal tracking
  isCustomerVisible: boolean;
  
  createdAt: Date;
}

export interface CustomsDeclaration {
  contentType: 'MERCHANDISE' | 'SAMPLE' | 'GIFT' | 'DOCUMENTS' | 'RETURN';
  currency: string;
  totalValue: number;
  itemsDescription: string;
  
  // Certifications
  certificateNumber?: string | null;
  invoiceNumber?: string | null;
  exportLicense?: string | null;
  
  // Additional info
  nonDeliveryOption: 'RETURN' | 'ABANDON';
  reasonForExport?: string | null;
  additionalInfo?: string | null;
  
  items: CustomsItem[];
}

export interface CustomsItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight: number;
  hsCode?: string | null;
  countryOfOrigin: string;
  sku?: string | null;
}

export interface ShippingZone {
  id: string;
  name: string;
  description?: string | null;
  countries: string[];
  regions?: string[] | null;
  postalCodes?: string[] | null;
  isActive: boolean;
  
  // Methods available in this zone
  shippingMethods: ShippingZoneMethod[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingZoneMethod {
  id: string;
  zoneId: string;
  shippingMethodId: string;
  isActive: boolean;
  
  // Zone-specific pricing
  baseRate?: number | null;
  perKgRate?: number | null;
  perItemRate?: number | null;
  freeShippingThreshold?: number | null;
  
  // Zone-specific delivery estimates
  estimatedDays?: {
    min: number;
    max: number;
  } | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingRateRequest {
  fromAddress: Partial<ShippingAddress>;
  toAddress: Partial<ShippingAddress>;
  packages: Array<{
    weight: number;
    weightUnit: WeightUnit;
    dimensions: ShippingDimensions;
    value: number;
  }>;
  currency: string;
  serviceTypes?: string[] | null;
}

export interface ShippingRate {
  methodId: string;
  methodName: string;
  provider: ShippingProvider;
  serviceCode: string;
  cost: number;
  currency: string;
  estimatedDays: {
    min: number;
    max: number;
  };
  estimatedDelivery: Date;
  features: string[];
  
  // Additional costs
  baseRate: number;
  fuelSurcharge?: number | null;
  residentialSurcharge?: number | null;
  signatureSurcharge?: number | null;
  insuranceCost?: number | null;
  
  // Restrictions
  maxWeight?: number | null;
  maxDimensions?: ShippingDimensions | null;
}

export interface CreateShipmentRequest {
  orderId: string;
  shippingMethodId: string;
  packages: Array<{
    type: PackageType;
    weight: number;
    weightUnit: WeightUnit;
    dimensions: ShippingDimensions;
    items: Array<{
      orderItemId: string;
      quantity: number;
    }>;
    declaredValue: number;
    description?: string;
    isFragile?: boolean;
    isHazardous?: boolean;
  }>;
  fromAddress?: Partial<ShippingAddress>;
  toAddress?: Partial<ShippingAddress>;
  deliveryInstructions?: string;
  signatureRequired?: boolean;
  insuranceAmount?: number;
  customsDeclaration?: Partial<CustomsDeclaration>;
}

export interface UpdateShipmentRequest {
  status?: ShippingStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  deliveryInstructions?: string;
  notes?: string;
}

export interface ShippingLabel {
  id: string;
  shipmentId: string;
  format: 'PDF' | 'PNG' | 'ZPL' | 'EPL';
  size: '4x6' | '8.5x11' | 'A4';
  url: string;
  trackingNumber: string;
  cost: number;
  currency: string;
  createdAt: Date;
  expiresAt?: Date | null;
}

export interface DeliveryAttempt {
  id: string;
  shipmentId: string;
  attemptNumber: number;
  status: 'DELIVERED' | 'FAILED' | 'RESCHEDULED';
  timestamp: Date;
  location?: string | null;
  failureReason?: string | null;
  signature?: string | null;
  photo?: string | null;
  nextAttemptDate?: Date | null;
  
  // Delivery person info
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleInfo?: string | null;
  
  createdAt: Date;
}

export interface ShippingAnalytics {
  overview: {
    totalShipments: number;
    deliveredShipments: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    totalShippingCost: number;
    onTimeDeliveryRate: number;
  };
  byProvider: Array<{
    provider: ShippingProvider;
    shipments: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    cost: number;
    onTimeRate: number;
  }>;
  byMethod: Array<{
    methodId: string;
    methodName: string;
    shipments: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    popularityPercentage: number;
  }>;
  byDestination: Array<{
    country: string;
    shipments: number;
    deliveryRate: number;
    averageDeliveryTime: number;
  }>;
  performanceChart: Array<{
    date: string;
    shipments: number;
    delivered: number;
    deliveryRate: number;
    averageDeliveryTime: number;
  }>;
  issues: {
    failedDeliveries: number;
    delayedShipments: number;
    lostPackages: number;
    damagedPackages: number;
    returnedShipments: number;
  };
}

export interface ShippingPreferences {
  defaultFromAddress?: ShippingAddress | null;
  preferredProviders: ShippingProvider[];
  autoSelectCheapest: boolean;
  autoSelectFastest: boolean;
  requireSignature: boolean;
  includeInsurance: boolean;
  packingSlipIncluded: boolean;
  enableTracking: boolean;
  sendTrackingEmails: boolean;
  sendDeliveryNotifications: boolean;
}

export interface BulkShipmentRequest {
  orderIds: string[];
  shippingMethodId: string;
  fromAddress?: Partial<ShippingAddress>;
  defaultPackageType?: PackageType;
  autoCalculateWeight?: boolean;
  signatureRequired?: boolean;
}

export interface ShippingRule {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  priority: number;
  
  // Conditions
  conditions: {
    minOrderValue?: number | null;
    maxOrderValue?: number | null;
    totalWeight?: number | null;
    productCategories?: string[] | null;
    customerGroups?: string[] | null;
    destinationCountries?: string[] | null;
    destinationRegions?: string[] | null;
  };
  
  // Actions
  actions: {
    freeShipping?: boolean | null;
    discountPercentage?: number | null;
    discountAmount?: number | null;
    forceMethod?: string | null;
    addSurcharge?: number | null;
    requireSignature?: boolean | null;
    includeInsurance?: boolean | null;
  };
  
  createdAt: Date;
  updatedAt: Date;
}