import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PERMISSIONS, USER_STATUSES } from '@/lib/constants';
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
    if (!checker.hasPermission(PERMISSIONS.VENDORS_APPROVE)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    const body = await request.json();
    const { status, notes, commissionRate } = body;

    const vendor = await db.vendor.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    });

    if (!vendor) {
      return NextResponse.json({
        success: false,
        message: 'Vendor not found',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 404 });
    }

    // Update vendor status
    const updatedVendor = await db.vendor.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes: notes,
        ...(commissionRate && { commissionRate }),
        ...(status === 'APPROVED' && {
          approvedAt: new Date(),
          approvedBy: session.user.id
        })
      }
    });

    // Update user status accordingly
    const userStatus = status === 'APPROVED' ? USER_STATUSES.ACTIVE : USER_STATUSES.SUSPENDED;
    await db.user.update({
      where: { id: vendor.userId },
      data: { status: userStatus }
    });

    // Create notification
    await db.notification.create({
      data: {
        userId: vendor.userId,
        type: status === 'APPROVED' ? 'VENDOR_APPROVED' : 'VENDOR_REJECTED',
        title: status === 'APPROVED' ? 'Vendor Application Approved' : 'Vendor Application Rejected',
        message: status === 'APPROVED'
          ? 'Congratulations! Your vendor application has been approved. You can now start selling.'
          : `Your vendor application was rejected. ${notes || 'Please contact support for more information.'}`,
        data: JSON.stringify({ vendorId: vendor.id }),
        isRead: false
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedVendor,
      message: `Vendor ${status.toLowerCase()} successfully`,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Vendor approval API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update vendor status',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}