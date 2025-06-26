import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PERMISSIONS } from '@/lib/constants';
import { PermissionChecker } from '@/lib/permissions';
import { ApiResponse } from '@/types/api';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                vendor: {
                  select: {
                    id: true,
                    storeName: true,
                    user: {
                      select: {
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        shippingAddress: true,
        billingAddress: true,
        payments: true,
        history: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!order) {
      return NextResponse.json({
        success: false,
        message: 'Order not found',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get order API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch order',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    if (!checker.hasPermission(PERMISSIONS.ORDERS_WRITE)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    const body = await request.json();
    const { status, paymentStatus, trackingNumber, notes, notifyCustomer } = body;

    const order = await db.order.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
        ...(trackingNumber && { trackingNumber }),
        ...(notes && { adminNotes: notes }),
        updatedAt: new Date()
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Add to order history
    await db.orderHistory.create({
      data: {
        orderId: params.id,
        status: status || order.status,
        comment: notes || `Order updated by admin`,
        isCustomerVisible: notifyCustomer || false,
        createdBy: session.user.id
      }
    });

    // Send notification if requested
    if (notifyCustomer) {
      // TODO: Send email notification to customer
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Update order API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update order',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}