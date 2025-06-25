import {
  ShippingMethod,
  ShippingRate,
  ShippingRateRequest,
  ShippingDimensions,
  WeightUnit,
  DimensionUnit,
  ShippingProvider,
  PackageType,
} from '@/types/shipping';
import { 
  CartItem,
  Cart,
  ShippingOption,
  CartShippingCalculation 
} from '@/types/cart';
import { VendorShippingInfo } from '@/types/vendor';

// Shipping calculation utilities
export class ShippingCalculator {
  private shippingMethods: ShippingMethod[] = [];
  private vendorShippingInfo: Map<string, VendorShippingInfo> = new Map();

  constructor(shippingMethods: ShippingMethod[] = []) {
    this.shippingMethods = shippingMethods;
  }

  // Set vendor shipping information
  setVendorShippingInfo(vendorId: string, shippingInfo: VendorShippingInfo): void {
    this.vendorShippingInfo.set(vendorId, shippingInfo);
  }

  // Calculate shipping rates for a cart
  async calculateCartShipping(
    cart: Cart,
    shippingAddress: {
      country: string;
      state: string;
      city: string;
      postalCode: string;
    }
  ): Promise<CartShippingCalculation> {
    // Group items by vendor
    const itemsByVendor = this.groupItemsByVendor(cart.items);
    
    // Calculate shipping for each vendor
    const vendorShippingRates: Array<{
      vendorId: string;
      rates: ShippingRate[];
      weight: number;
      dimensions: ShippingDimensions;
    }> = [];

    for (const [vendorId, items] of itemsByVendor) {
      const vendorShipping = this.vendorShippingInfo.get(vendorId);
      const packageInfo = this.calculatePackageInfo(items);
      
      const rates = await this.calculateVendorShipping(
        vendorId,
        items,
        shippingAddress,
        packageInfo
      );

      vendorShippingRates.push({
        vendorId,
        rates,
        weight: packageInfo.weight,
        dimensions: packageInfo.dimensions,
      });
    }

    // Combine shipping options
    const combinedOptions = this.combineShippingOptions(vendorShippingRates);
    
    // Calculate total package dimensions and weight
    const totalPackageInfo = this.calculateTotalPackageInfo(cart.items);

    return {
      shippingAddress,
      options: combinedOptions,
      totalWeight: totalPackageInfo.weight,
      totalDimensions: {
        ...totalPackageInfo.dimensions,
        unit: totalPackageInfo.dimensions.unit as "CM" | "IN",
      },
      estimatedDelivery: this.calculateEstimatedDelivery(combinedOptions[0]),
    };
  }

  // Calculate shipping rates for individual items
  async calculateItemShipping(
    items: CartItem[],
    shippingAddress: {
      country: string;
      state: string;
      city: string;
      postalCode: string;
    }
  ): Promise<ShippingRate[]> {
    const packageInfo = this.calculatePackageInfo(items);
    
    const request: ShippingRateRequest = {
      fromAddress: this.getOriginAddress(),
      toAddress: {
        country: shippingAddress.country,
        state: shippingAddress.state,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
      },
      packages: [{
        weight: packageInfo.weight,
        weightUnit: WeightUnit.KG,
        dimensions: packageInfo.dimensions,
        value: this.calculateItemsValue(items),
      }],
      currency: 'USD',
    };

    return this.calculateRatesFromRequest(request);
  }

  // Calculate vendor-specific shipping
  private async calculateVendorShipping(
    vendorId: string,
    items: CartItem[],
    shippingAddress: any,
    packageInfo: { weight: number; dimensions: ShippingDimensions }
  ): Promise<ShippingRate[]> {
    const vendorShipping = this.vendorShippingInfo.get(vendorId);
    const itemsValue = this.calculateItemsValue(items);

    if (!vendorShipping) {
      // Use default shipping methods
      return this.calculateDefaultShipping(packageInfo, itemsValue, shippingAddress);
    }

    const rates: ShippingRate[] = [];

    // Check for free shipping threshold
    if (vendorShipping.freeShippingEnabled && 
        vendorShipping.freeShippingMinAmount && 
        itemsValue >= vendorShipping.freeShippingMinAmount) {
      rates.push({
        methodId: `${vendorId}-free`,
        methodName: 'Free Shipping',
        provider: ShippingProvider.CUSTOM,
        serviceCode: 'FREE',
        cost: 0,
        currency: 'USD',
        estimatedDays: { min: 5, max: 7 },
        estimatedDelivery: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        features: ['free_shipping'],
        baseRate: 0,
      });
    }

    // Local delivery option
    if (vendorShipping.localDeliveryEnabled && this.isLocalDelivery(shippingAddress)) {
      rates.push({
        methodId: `${vendorId}-local`,
        methodName: 'Local Delivery',
        provider: ShippingProvider.LOCAL_COURIER,
        serviceCode: 'LOCAL',
        cost: vendorShipping.localDeliveryFee || 0,
        currency: 'USD',
        estimatedDays: { min: 1, max: 2 },
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
        features: ['local_delivery'],
        baseRate: vendorShipping.localDeliveryFee || 0,
      });
    }

    // Vendor's custom shipping rates
    vendorShipping.shippingRates.forEach(rate => {
      if (this.isRateApplicable(rate, shippingAddress, packageInfo.weight)) {
        const finalCost = this.calculateFinalShippingCost(rate.rate, itemsValue, rate.freeThreshold);
        
        rates.push({
          methodId: rate.id,
          methodName: rate.name,
          provider: ShippingProvider.CUSTOM,
          serviceCode: rate.name.toUpperCase().replace(/\s+/g, '_'),
          cost: finalCost,
          currency: 'USD',
          estimatedDays: rate.estimatedDays,
          estimatedDelivery: this.calculateDeliveryDate(rate.estimatedDays),
          features: [],
          baseRate: rate.rate,
          fuelSurcharge: this.calculateFuelSurcharge(rate.rate),
        });
      }
    });

    return rates;
  }

  // Calculate default shipping when vendor doesn't have custom rates
  private async calculateDefaultShipping(
    packageInfo: { weight: number; dimensions: ShippingDimensions },
    itemsValue: number,
    shippingAddress: any
  ): Promise<ShippingRate[]> {
    const applicableMethods = this.shippingMethods.filter(method => 
      method.isActive && this.isMethodAvailable(method, shippingAddress)
    );

    return applicableMethods.map(method => {
      const baseCost = this.calculateMethodCost(method, packageInfo, itemsValue);
      
      return {
        methodId: method.id,
        methodName: method.name,
        provider: method.provider,
        serviceCode: method.serviceCode,
        cost: baseCost,
        currency: 'USD',
        estimatedDays: method.estimatedDays,
        estimatedDelivery: this.calculateDeliveryDate(method.estimatedDays),
        features: method.features.map(f => f.code),
        baseRate: method.baseRate,
        fuelSurcharge: this.calculateFuelSurcharge(baseCost),
        residentialSurcharge: this.calculateResidentialSurcharge(shippingAddress),
      };
    });
  }

  // Calculate shipping cost for a specific method
  private calculateMethodCost(
    method: ShippingMethod,
    packageInfo: { weight: number; dimensions: ShippingDimensions },
    itemsValue: number
  ): number {
    let cost = method.baseRate;

    // Add weight-based cost
    if (method.perKgRate && packageInfo.weight > 0) {
      cost += method.perKgRate * packageInfo.weight;
    }

    // Check for free shipping threshold
    if (method.freeShippingThreshold && itemsValue >= method.freeShippingThreshold) {
      return 0;
    }

    // Apply dimensional weight if applicable
    const dimensionalWeight = this.calculateDimensionalWeight(packageInfo.dimensions);
    if (dimensionalWeight > packageInfo.weight) {
      const weightDifference = dimensionalWeight - packageInfo.weight;
      if (method.perKgRate) {
        cost += method.perKgRate * weightDifference;
      }
    }

    return Math.max(0, cost);
  }

  // Calculate package information from cart items
  private calculatePackageInfo(items: CartItem[]): { weight: number; dimensions: ShippingDimensions } {
    let totalWeight = 0;
    let totalVolume = 0;
    
    items.forEach(item => {
      const weight = item.product.weight || item.variant?.weight || 0.5; // Default 0.5kg
      totalWeight += weight * item.quantity;

      // Calculate volume for dimensions
      const dimensions = item.product.dimensions || item.variant?.dimensions;
      if (dimensions) {
        const volume = dimensions.length * dimensions.width * dimensions.height;
        totalVolume += volume * item.quantity;
      } else {
        // Default dimensions for small package
        totalVolume += 20 * 15 * 10 * item.quantity; // 20x15x10 cm default
      }
    });

    // Calculate approximate box dimensions from total volume
    const cubeRoot = Math.cbrt(totalVolume);
    const estimatedDimensions: ShippingDimensions = {
      length: Math.max(cubeRoot * 1.3, 20), // Slightly elongated
      width: Math.max(cubeRoot * 1.1, 15),
      height: Math.max(cubeRoot * 0.8, 10),
      unit: DimensionUnit.CM,
    };

    return {
      weight: totalWeight,
      dimensions: estimatedDimensions,
    };
  }

  // Calculate total package info for entire cart
  private calculateTotalPackageInfo(items: CartItem[]): { weight: number; dimensions: ShippingDimensions } {
    return this.calculatePackageInfo(items);
  }

  // Group cart items by vendor
  private groupItemsByVendor(items: CartItem[]): Map<string, CartItem[]> {
    const grouped = new Map<string, CartItem[]>();
    
    items.forEach(item => {
      const vendorId = item.vendor.id;
      if (!grouped.has(vendorId)) {
        grouped.set(vendorId, []);
      }
      grouped.get(vendorId)!.push(item);
    });

    return grouped;
  }

  // Combine shipping options from multiple vendors
  private combineShippingOptions(
    vendorRates: Array<{
      vendorId: string;
      rates: ShippingRate[];
      weight: number;
      dimensions: ShippingDimensions;
    }>
  ): ShippingOption[] {
    if (vendorRates.length === 0) return [];
    if (vendorRates.length === 1) {
      return vendorRates[0].rates.map(rate => this.mapRateToOption(rate));
    }

    // For multiple vendors, combine compatible shipping methods
    const combinedOptions: ShippingOption[] = [];
    const methodGroups = this.groupRatesByMethod(vendorRates);

    methodGroups.forEach((rates, methodKey) => {
      const totalCost = rates.reduce((sum, rate) => sum + rate.cost, 0);
      const maxDeliveryTime = Math.max(...rates.map(rate => rate.estimatedDays.max));
      const minDeliveryTime = Math.max(...rates.map(rate => rate.estimatedDays.min));

      combinedOptions.push({
        id: `combined-${methodKey}`,
        name: `Combined ${rates[0].methodName}`,
        cost: totalCost,
        estimatedDays: { min: minDeliveryTime, max: maxDeliveryTime },
        trackingEnabled: true,
        vendorRates: rates.map(rate => ({
          vendorId: rate.methodId.split('-')[0],
          rate: rate.cost,
          processingTime: { min: 1, max: 2, unit: 'days' },
        })),
      });
    });

    return combinedOptions;
  }

  // Group rates by shipping method type
  private groupRatesByMethod(
    vendorRates: Array<{ vendorId: string; rates: ShippingRate[] }>
  ): Map<string, ShippingRate[]> {
    const groups = new Map<string, ShippingRate[]>();

    vendorRates.forEach(({ rates }) => {
      rates.forEach(rate => {
        const methodKey = this.getMethodKey(rate);
        if (!groups.has(methodKey)) {
          groups.set(methodKey, []);
        }
        groups.get(methodKey)!.push(rate);
      });
    });

    // Only keep groups where all vendors have the method
    const completeGroups = new Map<string, ShippingRate[]>();
    groups.forEach((rates, methodKey) => {
      if (rates.length === vendorRates.length) {
        completeGroups.set(methodKey, rates);
      }
    });

    return completeGroups;
  }

  // Get method key for grouping
  private getMethodKey(rate: ShippingRate): string {
    // Group by delivery speed
    if (rate.estimatedDays.max <= 2) return 'express';
    if (rate.estimatedDays.max <= 5) return 'standard';
    return 'economy';
  }

  // Map shipping rate to shipping option
  private mapRateToOption(rate: ShippingRate): ShippingOption {
    return {
      id: rate.methodId,
      name: rate.methodName,
      description: `Estimated delivery in ${rate.estimatedDays.min}-${rate.estimatedDays.max} business days`,
      cost: rate.cost,
      estimatedDays: rate.estimatedDays,
      trackingEnabled: rate.features.includes('tracking'),
    };
  }

  // Calculate items value
  private calculateItemsValue(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.totalPrice), 0);
  }

  // Calculate dimensional weight (for air shipping)
  private calculateDimensionalWeight(dimensions: ShippingDimensions): number {
    const { length, width, height, unit } = dimensions;
    
    // Convert to cm if needed
    let l = length, w = width, h = height;
    if (unit === DimensionUnit.IN) {
      l *= 2.54;
      w *= 2.54;
      h *= 2.54;
    }

    // Dimensional weight formula: L × W × H / 5000 (for cm to kg)
    return (l * w * h) / 5000;
  }

  // Calculate fuel surcharge
  private calculateFuelSurcharge(baseCost: number): number {
    return baseCost * 0.05; // 5% fuel surcharge
  }

  // Calculate residential surcharge
  private calculateResidentialSurcharge(address: any): number {
    // Simple logic - in real implementation, would check address type
    return 2.50;
  }

  // Check if shipping method is available for destination
  private isMethodAvailable(method: ShippingMethod, address: any): boolean {
    return method.availableCountries.includes(address.country);
  }

  // Check if rate is applicable
  private isRateApplicable(
    rate: any,
    address: any,
    weight: number
  ): boolean {
    // Check if destination is in rate's regions
    if (rate.regions && rate.regions.length > 0) {
      return rate.regions.includes(address.country);
    }

    // Check weight limits
    if (rate.weightLimits) {
      return weight >= rate.weightLimits.min && weight <= rate.weightLimits.max;
    }

    return true;
  }

  // Check if address qualifies for local delivery
  private isLocalDelivery(address: any): boolean {
    // Simple implementation - would use geocoding in real application
    return address.city === 'Local City'; // Replace with actual logic
  }

  // Calculate final shipping cost with free threshold
  private calculateFinalShippingCost(
    baseCost: number,
    orderValue: number,
    freeThreshold?: number | null
  ): number {
    if (freeThreshold && orderValue >= freeThreshold) {
      return 0;
    }
    return baseCost;
  }

  // Calculate estimated delivery date
  private calculateDeliveryDate(estimatedDays: { min: number; max: number }): Date {
    const avgDays = (estimatedDays.min + estimatedDays.max) / 2;
    return new Date(Date.now() + avgDays * 24 * 60 * 60 * 1000);
  }

  // Calculate estimated delivery for combined shipping
  private calculateEstimatedDelivery(option: ShippingOption): Date {
    return new Date(Date.now() + option.estimatedDays.max * 24 * 60 * 60 * 1000);
  }

  // Get origin address (warehouse/store location)
  private getOriginAddress(): any {
    return {
      street: '123 Warehouse St',
      city: 'Shipping City',
      state: 'ST',
      postalCode: '12345',
      country: 'US',
    };
  }

  // Calculate rates from shipping request
  private async calculateRatesFromRequest(request: ShippingRateRequest): Promise<ShippingRate[]> {
    // This would integrate with actual shipping providers
    return [
      {
        methodId: 'standard',
        methodName: 'Standard Shipping',
        provider: ShippingProvider.CUSTOM,
        serviceCode: 'STANDARD',
        cost: 9.99,
        currency: request.currency,
        estimatedDays: { min: 3, max: 5 },
        estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        features: ['tracking'],
        baseRate: 9.99,
      },
      {
        methodId: 'express',
        methodName: 'Express Shipping',
        provider: ShippingProvider.CUSTOM,
        serviceCode: 'EXPRESS',
        cost: 19.99,
        currency: request.currency,
        estimatedDays: { min: 1, max: 2 },
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
        features: ['tracking', 'signature'],
        baseRate: 19.99,
      },
    ];
  }
}

// Tax calculation utilities
export class TaxCalculator {
  private taxRates: Map<string, number> = new Map();

  constructor() {
    // Initialize with default tax rates
    this.taxRates.set('US', 0.08); // 8% average US sales tax
    this.taxRates.set('CA', 0.13); // 13% Canadian tax
    this.taxRates.set('GB', 0.20); // 20% UK VAT
    this.taxRates.set('DE', 0.19); // 19% German VAT
  }

  // Calculate tax for cart
  calculateCartTax(
    cart: Cart,
    shippingAddress: { country: string; state?: string }
  ): number {
    const taxableAmount = this.getTaxableAmount(cart);
    const taxRate = this.getTaxRate(shippingAddress);
    
    return taxableAmount * taxRate;
  }

  // Calculate tax for individual items
  calculateItemTax(
    items: CartItem[],
    shippingAddress: { country: string; state?: string }
  ): number {
    const taxableAmount = items
      .filter(item => item.product.type === 'PHYSICAL') // Only physical products are taxable
      .reduce((total, item) => total + item.totalPrice, 0);
    
    const taxRate = this.getTaxRate(shippingAddress);
    return taxableAmount * taxRate;
  }

  // Get taxable amount from cart
  private getTaxableAmount(cart: Cart): number {
    return cart.items
      .filter(item => item.product.type === 'PHYSICAL')
      .reduce((total, item) => total + item.totalPrice, 0);
  }

  // Get tax rate for location
  private getTaxRate(address: { country: string; state?: string }): number {
    // In a real implementation, this would be much more sophisticated
    // with state/province specific rates, zip code lookup, etc.
    
    const countryRate = this.taxRates.get(address.country) || 0;
    
    // Add state-specific logic for US
    if (address.country === 'US' && address.state) {
      const stateRates: Record<string, number> = {
        'CA': 0.10,  // California
        'NY': 0.08,  // New York
        'TX': 0.0625, // Texas
        'FL': 0.06,  // Florida
        // Add more states as needed
      };
      
      return stateRates[address.state] || countryRate;
    }

    return countryRate;
  }

  // Set custom tax rate
  setTaxRate(location: string, rate: number): void {
    this.taxRates.set(location, rate);
  }

  // Check if location has tax
  hasTax(address: { country: string; state?: string }): boolean {
    return this.getTaxRate(address) > 0;
  }
}

// Discount calculation utilities
export class DiscountCalculator {
  // Calculate total discount for cart
  calculateCartDiscount(cart: Cart): number {
    return cart.appliedCoupons.reduce((total, coupon) => total + coupon.discountAmount, 0);
  }

  // Calculate volume discount
  calculateVolumeDiscount(quantity: number, price: number): number {
    // Simple volume discount tiers
    if (quantity >= 10) return price * 0.15; // 15% off for 10+
    if (quantity >= 5) return price * 0.10;  // 10% off for 5+
    if (quantity >= 3) return price * 0.05;  // 5% off for 3+
    return 0;
  }

  // Calculate loyalty discount
  calculateLoyaltyDiscount(userTotalSpent: number, orderAmount: number): number {
    // Loyalty tiers based on total spent
    let discountRate = 0;
    
    if (userTotalSpent >= 5000) discountRate = 0.10; // 10% for $5000+ customers
    else if (userTotalSpent >= 1000) discountRate = 0.05; // 5% for $1000+ customers
    else if (userTotalSpent >= 500) discountRate = 0.02; // 2% for $500+ customers
    
    return orderAmount * discountRate;
  }

  // Calculate seasonal discount
  calculateSeasonalDiscount(orderAmount: number, seasonCode?: string): number {
    const seasonalRates: Record<string, number> = {
      'HOLIDAY': 0.20, // 20% holiday discount
      'SUMMER': 0.15,  // 15% summer sale
      'SPRING': 0.10,  // 10% spring sale
      'WINTER': 0.05,  // 5% winter clearance
    };

    const rate = seasonCode ? seasonalRates[seasonCode] || 0 : 0;
    return orderAmount * rate;
  }

  // Calculate bundle discount
  calculateBundleDiscount(items: CartItem[]): number {
    // Simple bundle logic - if cart has items from different categories
    const categories = new Set(items.map(item => item.product.id)); // Simplified
    
    if (categories.size >= 3) return 50; // $50 off for 3+ different categories
    if (categories.size >= 2) return 25; // $25 off for 2+ different categories
    
    return 0;
  }
}

// Order total calculation utilities
export class OrderCalculator {
  private shippingCalculator: ShippingCalculator;
  private taxCalculator: TaxCalculator;
  private discountCalculator: DiscountCalculator;

  constructor() {
    this.shippingCalculator = new ShippingCalculator();
    this.taxCalculator = new TaxCalculator();
    this.discountCalculator = new DiscountCalculator();
  }

  // Calculate complete order totals
  async calculateOrderTotals(
    cart: Cart,
    shippingAddress: { country: string; state: string; city: string; postalCode: string },
    selectedShippingMethod?: string
  ): Promise<{
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    savings: number;
  }> {
    // Calculate subtotal
    const subtotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);

    // Calculate shipping
    let shippingCost = 0;
    if (selectedShippingMethod) {
      const shippingRates = await this.shippingCalculator.calculateItemShipping(cart.items, shippingAddress);
      const selectedRate = shippingRates.find(rate => rate.methodId === selectedShippingMethod);
      shippingCost = selectedRate?.cost || 0;
    }

    // Calculate tax (on subtotal + shipping)
    const taxableAmount = subtotal + shippingCost;
    const taxAmount = this.taxCalculator.calculateCartTax(cart, shippingAddress);

    // Calculate discounts
    const discountAmount = this.discountCalculator.calculateCartDiscount(cart);

    // Calculate final total
    const total = Math.max(0, subtotal + shippingCost + taxAmount - discountAmount);

    // Calculate savings (compare prices, volume discounts, etc.)
    const savings = cart.items.reduce((total, item) => {
      const comparePrice = item.product.comparePrice || 0;
      if (comparePrice > item.unitPrice) {
        return total + ((comparePrice - item.unitPrice) * item.quantity);
      }
      return total;
    }, 0) + discountAmount;

    return {
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total,
      savings,
    };
  }

  // Calculate commission for vendors
  calculateVendorCommission(
    orderItems: CartItem[],
    vendorCommissionRate: number
  ): number {
    const vendorTotal = orderItems.reduce((total, item) => total + item.totalPrice, 0);
    return vendorTotal * (vendorCommissionRate / 100);
  }

  // Calculate platform fees
  calculatePlatformFees(orderTotal: number, feePercentage: number = 2.9): number {
    return orderTotal * (feePercentage / 100);
  }

  // Calculate estimated delivery date
  calculateEstimatedDelivery(
    processingTime: { min: number; max: number; unit: 'days' | 'hours' },
    shippingTime: { min: number; max: number }
  ): Date {
    const processingDays = processingTime.unit === 'hours' 
      ? processingTime.max / 24 
      : processingTime.max;
    
    const totalDays = processingDays + shippingTime.max;
    return new Date(Date.now() + totalDays * 24 * 60 * 60 * 1000);
  }
}

// Export calculator instances
export const shippingCalculator = new ShippingCalculator();
export const taxCalculator = new TaxCalculator();
export const discountCalculator = new DiscountCalculator();
export const orderCalculator = new OrderCalculator();

// Export all calculators as default
export default {
  ShippingCalculator,
  TaxCalculator,
  DiscountCalculator,
  OrderCalculator,
  shippingCalculator,
  taxCalculator,
  discountCalculator,
  orderCalculator,
};