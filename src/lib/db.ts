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
    const results = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const result = await model.createMany({
        data: batch,
        skipDuplicates: true,
      });
      results.push(result);
    }

    return results;