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
    if (!checker.hasPermission(PERMISSIONS.ORDERS_READ)) {
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
    const paymentStatus = searchParams.get('paymentStatus');
    const vendorId = searchParams.get('vendorId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (vendorId) {
      where.items = {
        some: {
          product: {
            vendorId: vendorId
          }
        }
      };
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  vendor: {
                    select: {
                      id: true,
                      storeName: true
                    }
                  }
                }
              }
            }
          },
          shippingAddress: true,
          _count: {
            select: {
              items: true
            }
          }
        }
      }),
      db.order.count({ where })
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
      data: orders,
      meta: { pagination },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Orders API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch orders',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}