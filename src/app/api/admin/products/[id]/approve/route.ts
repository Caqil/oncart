import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PERMISSIONS, PRODUCT_STATUSES } from '@/lib/constants';
import { PermissionChecker } from '@/lib/permissions';
import { ApiResponse } from '@/types/api';

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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
    if (!checker.hasPermission(PERMISSIONS.PRODUCTS_APPROVE)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    const body = await request.json();
    const { approved, notes } = body;

    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        vendor: {
          include: {
            user: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 404 });
    }

    const newStatus = approved ? PRODUCT_STATUSES.PUBLISHED : PRODUCT_STATUSES.REJECTED;

    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        adminNotes: notes,
        ...(approved && {
          approvedAt: new Date(),
          approvedBy: session.user.id,
          publishedAt: new Date()
        }),
        ...(!approved && {
          rejectedAt: new Date(),
          rejectedBy: session.user.id
        })
      }
    });

    // Create notification for vendor
    await db.notification.create({
      data: {
        userId: product.vendor.userId,
        type: approved ? 'PRODUCT_APPROVED' : 'PRODUCT_REJECTED',
        title: approved ? 'Product Approved' : 'Product Rejected',
        message: approved 
          ? `Your product "${product.name}" has been approved and is now live.`
          : `Your product "${product.name}" was rejected. ${notes || 'Please review and resubmit.'}`,
        data: JSON.stringify({ productId: product.id }),
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: `Product ${approved ? 'approved' : 'rejected'} successfully`,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Product approval API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update product status',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}