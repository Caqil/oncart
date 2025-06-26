import { PrismaClient } from '@prisma/client';

// Extend PrismaClient to add custom methods and middleware
class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });

    // Add middleware for automatic timestamps, soft deletes, etc.
    this.addMiddleware();
  }

  private addMiddleware() {
    // Soft delete middleware
    this.$use(async (params, next) => {
      // Check if the operation is a delete
      if (params.action === 'delete') {
        // Change action to update and set deletedAt
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
      }

      // Check if the operation is deleteMany
      if (params.action === 'deleteMany') {
        // Change action to updateMany and set deletedAt
        params.action = 'updateMany';
        if (params.args.data !== undefined) {
          params.args.data['deletedAt'] = new Date();
        } else {
          params.args['data'] = { deletedAt: new Date() };
        }
      }

      return next(params);
    });

    // Filter out soft deleted records for read operations
    this.$use(async (params, next) => {
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // Add deletedAt: null to where clause
        params.args.where['deletedAt'] = null;
      }

      if (params.action === 'findMany') {
        // Add deletedAt: null to where clause
        if (params.args.where) {
          if (params.args.where.deletedAt === undefined) {
            params.args.where['deletedAt'] = null;
          }
        } else {
          params.args['where'] = { deletedAt: null };
        }
      }

      return next(params);
    });

    // Automatic timestamps middleware
    this.$use(async (params, next) => {
      if (params.action === 'create') {
        params.args.data.createdAt = new Date();
        params.args.data.updatedAt = new Date();
      }

      if (params.action === 'createMany' && params.args.data) {
        const now = new Date();
        if (Array.isArray(params.args.data)) {
          params.args.data = params.args.data.map((item: any) => ({
            ...item,
            createdAt: now,
            updatedAt: now,
          }));
        }
      }

      if (params.action === 'update' || params.action === 'upsert') {
        params.args.data.updatedAt = new Date();
      }

      if (params.action === 'updateMany') {
        params.args.data.updatedAt = new Date();
      }

      return next(params);
    });

    // Logging middleware
    this.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();

      if (process.env.NODE_ENV === 'development') {
        console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
      }

      return result;
    });
  }

  // Custom methods for common operations
  async findManyWithPagination<T>(
    model: any,
    options: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 20, where, orderBy, include, select } = options;
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        include,
        select,
        skip: offset,
        take: limit,
      }),
      model.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    };
  }

  async softDelete(model: any, where: any) {
    return model.update({
      where,
      data: { deletedAt: new Date() },
    });
  }

  async softDeleteMany(model: any, where: any) {
    return model.updateMany({
      where,
      data: { deletedAt: new Date() },
    });
  }

  async restore(model: any, where: any) {
    return model.update({
      where,
      data: { deletedAt: null },
    });
  }

  async restoreMany(model: any, where: any) {
    return model.updateMany({
      where,
      data: { deletedAt: null },
    });
  }

  async findWithDeleted(model: any, options: any = {}) {
    return model.findMany({
      ...options,
      where: {
        ...options.where,
        // Override the middleware by explicitly setting deletedAt
      },
    });
  }

  async hardDelete(model: any, where: any) {
    // Bypass middleware for permanent deletion
    return this.$executeRaw`DELETE FROM ${model.name} WHERE ${where}`;
  }

// Bulk operations with better performance
  async bulkCreate<T>(model: any, data: T[], batchSize: number = 1000) {
    const results: any[] = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const result = await model.createMany({
        data: batch,
        skipDuplicates: true,
      });
      results.push(result);
    }

    return results;
  }

  async bulkUpdate<T>(model: any, updates: Array<{ where: any; data: T }>, batchSize: number = 100) {
    const results: any[] = [];
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const promises = batch.map(({ where, data }) => 
        model.update({ where, data })
      );
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  }

  async bulkUpsert<T>(model: any, operations: Array<{ where: any; update: T; create: T }>, batchSize: number = 100) {
    const results: any[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const promises = batch.map(({ where, update, create }) => 
        model.upsert({ where, update, create })
      );
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return results;
  }

  // Search functionality with full-text search
  async searchProducts(query: string, filters: any = {}, options: any = {}) {
    const { page = 1, limit = 20, sortBy = 'relevance', sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    // Build search conditions
    const searchConditions: any[] = [];

    if (query) {
      searchConditions.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: query.split(' ') } },
        ],
      });
    }

    // Apply filters
    const where = {
      AND: [
        ...searchConditions,
        { status: 'PUBLISHED' },
        { deletedAt: null },
        ...(filters.categoryId ? [{ categoryId: filters.categoryId }] : []),
        ...(filters.brandId ? [{ brandId: filters.brandId }] : []),
        ...(filters.vendorId ? [{ vendorId: filters.vendorId }] : []),
        ...(filters.priceMin ? [{ price: { gte: filters.priceMin } }] : []),
        ...(filters.priceMax ? [{ price: { lte: filters.priceMax } }] : []),
        ...(filters.inStock ? [{ quantity: { gt: 0 } }] : []),
        ...(filters.featured ? [{ featured: true }] : []),
      ],
    };

    // Build order by
    let orderBy = {};
    switch (sortBy) {
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'sales':
        orderBy = { totalSales: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [products, total] = await Promise.all([
      this.product.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          vendor: {
            select: {
              id: true,
              storeName: true,
              storeSlug: true,
              isVerified: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            take: 1,
            orderBy: { position: 'asc' },
          },
          _count: {
            select: {
              reviews: true,
              wishlistItems: true,
            },
          },
        },
      }),
      this.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    };
  }

  // Analytics helpers
  async getAnalyticsData(model: any, dateRange: { start: Date; end: Date }, groupBy: 'day' | 'week' | 'month' = 'day') {
    const { start, end } = dateRange;
    
    // This would need to be adapted based on your database
    // PostgreSQL example with date_trunc
    return this.$queryRaw`
      SELECT 
        DATE_TRUNC(${groupBy}, created_at) as period,
        COUNT(*) as count,
        SUM(CASE WHEN amount THEN amount ELSE 0 END) as total_amount
      FROM ${model}
      WHERE created_at >= ${start} AND created_at <= ${end}
      GROUP BY period
      ORDER BY period ASC
    `;
  }

  async getDashboardStats(userId?: string, vendorId?: string) {
    const dateRanges = {
      today: {
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      thisWeek: {
        start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
        end: new Date(),
      },
      thisMonth: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date(),
      },
      lastMonth: {
        start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        end: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      },
    };

    const whereConditions = {
      deletedAt: null,
      ...(vendorId && { vendorId }),
      ...(userId && { userId }),
    };

    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalVendors,
      recentOrders,
      topProducts,
      salesData,
    ] = await Promise.all([
      this.order.count({ where: whereConditions }),
      this.product.count({ where: { ...whereConditions, status: 'PUBLISHED' } }),
      this.user.count({ where: { deletedAt: null, role: 'CUSTOMER' } }),
      this.vendor.count({ where: { deletedAt: null, status: 'APPROVED' } }),
      this.order.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { take: 3, include: { product: { select: { name: true } } } },
        },
      }),
      this.product.findMany({
        where: { ...whereConditions, status: 'PUBLISHED' },
        orderBy: { totalSales: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          totalSales: true,
          price: true,
          images: { take: 1 },
        },
      }),
      this.order.aggregate({
        where: {
          ...whereConditions,
          createdAt: { gte: dateRanges.thisMonth.start },
        },
        _sum: { total: true },
        _avg: { total: true },
        _count: true,
      }),
    ]);

    return {
      overview: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalVendors,
        totalRevenue: salesData._sum.total || 0,
        averageOrderValue: salesData._avg.total || 0,
      },
      recentOrders,
      topProducts,
      salesData,
    };
  }

  // Inventory management
  async updateInventory(productId: string, variantId: string | null, quantity: number, operation: 'SET' | 'ADD' | 'SUBTRACT') {
    return this.$transaction(async (tx) => {
      if (variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
          select: { quantity: true },
        });

        if (!variant) {
          throw new Error('Product variant not found');
        }

        let newQuantity = variant.quantity;
        switch (operation) {
          case 'SET':
            newQuantity = quantity;
            break;
          case 'ADD':
            newQuantity = variant.quantity + quantity;
            break;
          case 'SUBTRACT':
            newQuantity = Math.max(0, variant.quantity - quantity);
            break;
        }

        return tx.productVariant.update({
          where: { id: variantId },
          data: { 
            quantity: newQuantity,
            stockStatus: newQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
          },
        });
      } else {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { quantity: true },
        });

        if (!product) {
          throw new Error('Product not found');
        }

        let newQuantity = product.quantity;
        switch (operation) {
          case 'SET':
            newQuantity = quantity;
            break;
          case 'ADD':
            newQuantity = product.quantity + quantity;
            break;
          case 'SUBTRACT':
            newQuantity = Math.max(0, product.quantity - quantity);
            break;
        }

        return tx.product.update({
          where: { id: productId },
          data: { 
            quantity: newQuantity,
            stockStatus: newQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
          },
        });
      }
    });
  }

  // Order management helpers
  async processOrder(orderId: string, status: string) {
    return this.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { 
          status,
          ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
          ...(status === 'SHIPPED' && { shippedAt: new Date() }),
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
        },
      });

      // If order is cancelled, restore inventory
      if (status === 'CANCELLED') {
        for (const item of order.items) {
          await this.updateInventory(item.productId, item.variantId, item.quantity, 'ADD');
        }
      }

      // Create order history entry
      await tx.orderHistory.create({
        data: {
          orderId,
          status,
          isCustomerVisible: true,
          comment: `Order ${status.toLowerCase()}`,
        },
      });

      return updatedOrder;
    });
  }

  // Cache management
  private cache = new Map<string, { data: any; expiresAt: number }>();

  async getCached<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expiresAt: now + (ttlSeconds * 1000),
    });

    return data;
  }

  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error, timestamp: new Date() };
    }
  }

  // Connection management
  async gracefulShutdown() {
    console.log('Gracefully shutting down database connection...');
    await this.$disconnect();
  }
}

// Global database instance
const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new ExtendedPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Database utilities
export class DatabaseUtils {
  static async migrate() {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      exec('npx prisma migrate deploy', (error, stdout, stderr) => {
        if (error) {
          console.error('Migration failed:', error);
          reject(error);
        } else {
          console.log('Migration completed:', stdout);
          resolve(stdout);
        }
      });
    });
  }

  static async seed() {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      exec('npx prisma db seed', (error, stdout, stderr) => {
        if (error) {
          console.error('Seeding failed:', error);
          reject(error);
        } else {
          console.log('Seeding completed:', stdout);
          resolve(stdout);
        }
      });
    });
  }

  static async backup(outputPath?: string) {
    const fs = require('fs');
    const path = require('path');
    
    const backupPath = outputPath || path.join(process.cwd(), 'backups', `backup-${Date.now()}.db`);
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
    
    // Ensure backup directory exists
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copy database file
    fs.copyFileSync(dbPath, backupPath);
    
    return { success: true, backupPath };
  }

  static async restore(backupPath: string) {
    const fs = require('fs');
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
    
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup file does not exist');
    }
    
    // Close existing connections
    await db.$disconnect();
    
    // Copy backup file over current database
    fs.copyFileSync(backupPath, dbPath);
    
    return { success: true };
  }

  static async getTableSizes() {
    const tables = await db.$queryRaw`
      SELECT 
        name as table_name,
        COUNT(*) as row_count
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;
    
    return tables;
  }

  static async vacuum() {
    await db.$executeRaw`VACUUM`;
    return { success: true, message: 'Database vacuumed successfully' };
  }

  static async analyze() {
    await db.$executeRaw`ANALYZE`;
    return { success: true, message: 'Database analyzed successfully' };
  }
}

// Error handling for database operations
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public operation?: string,
    public table?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Transaction helpers
export async function withTransaction<T>(
  callback: (tx: ExtendedPrismaClient) => Promise<T>
): Promise<T> {
  return db.$transaction(callback);
}

// Query builder helpers
export class QueryBuilder {
  private model: any;
  private conditions: any[] = [];
  private orderByClause: any = {};
  private includeClause: any = {};
  private selectClause: any = {};
  private pagination: { skip?: number; take?: number } = {};

  constructor(model: any) {
    this.model = model;
  }

  where(condition: any) {
    this.conditions.push(condition);
    return this;
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    this.orderByClause = { [field]: direction };
    return this;
  }

  include(relations: any) {
    this.includeClause = { ...this.includeClause, ...relations };
    return this;
  }

  select(fields: any) {
    this.selectClause = { ...this.selectClause, ...fields };
    return this;
  }

  paginate(page: number, limit: number) {
    this.pagination = {
      skip: (page - 1) * limit,
      take: limit,
    };
    return this;
  }

  async execute() {
    const where = this.conditions.length > 0 
      ? { AND: this.conditions }
      : {};

    return this.model.findMany({
      where,
      orderBy: this.orderByClause,
      include: Object.keys(this.includeClause).length > 0 ? this.includeClause : undefined,
      select: Object.keys(this.selectClause).length > 0 ? this.selectClause : undefined,
      ...this.pagination,
    });
  }

  async count() {
    const where = this.conditions.length > 0 
      ? { AND: this.conditions }
      : {};

    return this.model.count({ where });
  }

  async first() {
    const where = this.conditions.length > 0 
      ? { AND: this.conditions }
      : {};

    return this.model.findFirst({
      where,
      orderBy: this.orderByClause,
      include: Object.keys(this.includeClause).length > 0 ? this.includeClause : undefined,
      select: Object.keys(this.selectClause).length > 0 ? this.selectClause : undefined,
    });
  }
}

// Export query builder factory
export function query(model: any) {
  return new QueryBuilder(model);
}

export default db;