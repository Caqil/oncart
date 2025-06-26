import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PERMISSIONS } from '@/lib/constants';
import { PermissionChecker } from '@/lib/permissions';
import { ApiResponse } from '@/types/api';

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
    if (!checker.hasPermission(PERMISSIONS.ANALYTICS_READ)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Get dashboard stats
    const [
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      pendingVendors,
      lowStockProducts
    ] = await Promise.all([
      db.user.count(),
      db.vendor.count(),
      db.product.count(),
      db.order.count(),
      db.order.aggregate({
        _sum: { total: true },
        where: { status: 'COMPLETED' }
      }),
      db.order.count({ where: { status: 'PENDING' } }),
      db.vendor.count({ where: { status: 'PENDING_APPROVAL' } }),
      db.product.count({ where: { quantity: { lte: 10 } } })
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalVendors,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        pendingOrders,
        pendingVendors,
        lowStockProducts
      },
      recentActivity: await getRecentActivity(),
      salesChart: await getSalesChart(period),
      topProducts: await getTopProducts(),
      topVendors: await getTopVendors()
    };

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}

async function getRecentActivity() {
  return db.userActivity.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });
}

async function getSalesChart(period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return db.order.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: startDate },
      status: 'COMPLETED'
    },
    _sum: { total: true },
    _count: true
  });
}

async function getTopProducts() {
  return db.product.findMany({
    take: 5,
    orderBy: { totalSales: 'desc' },
    include: {
      vendor: {
        select: { storeName: true }
      }
    }
  });
}

async function getTopVendors() {
  return db.vendor.findMany({
    take: 5,
    orderBy: { totalSales: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });
}