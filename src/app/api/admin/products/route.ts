import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PERMISSIONS } from '@/lib/constants';
import { PermissionChecker } from '@/lib/permissions';
import { ApiResponse, Pagination } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 401 });
    }

    const checker = new PermissionChecker(session.user.role);
    if (!checker.hasPermission(PERMISSIONS.PRODUCTS_READ)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const categoryId = searchParams.get('categoryId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;
    if (categoryId) where.categoryId = categoryId;

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [products, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          vendor: {
            select: {
              id: true,
              storeName: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          images: {
            take: 1,
            orderBy: { position: 'asc' }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true
            }
          }
        }
      }),
      db.product.count({ where })
    ]);

    const pagination: Pagination = {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      hasNext: page * limit < totalCount,
      hasPrevious: page > 1
    };

    return NextResponse.json({
      success: true,
      data: products,
      meta: { pagination },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch products',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}