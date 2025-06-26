import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PERMISSIONS } from '@/lib/constants';
import { PermissionChecker } from '@/lib/permissions';
import { userValidations } from '@/lib/validations';
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
    if (!checker.hasPermission(PERMISSIONS.USERS_READ)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        vendor: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            orders: true,
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 404 });
    }

    // Remove sensitive data
    const { password, passwordResetToken, passwordResetExpires, ...userWithoutSensitiveData } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutSensitiveData,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Get user API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch user',
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
    if (!checker.hasPermission(PERMISSIONS.USERS_WRITE)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    const body = await request.json();
    const validationResult = userValidations.updateUser.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        })),
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 400 });
    }

    const updateData = validationResult.data;

    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User updated successfully',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Update user API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update user',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
    if (!checker.hasPermission(PERMISSIONS.USERS_DELETE)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 404 });
    }

    // Prevent deleting self
    if (user.id === session.user.id) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete your own account',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 400 });
    }

    await db.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Delete user API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to delete user',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}