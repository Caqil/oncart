import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PERMISSIONS } from '@/lib/constants';
import { PermissionChecker } from '@/lib/permissions';
import { userValidations } from '@/lib/validations';
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
    if (!checker.hasPermission(PERMISSIONS.USERS_READ)) {
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
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) where.role = role;
    if (status) where.status = status;

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            }
          }
        }
      }),
      db.user.count({ where })
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
      data: users,
      meta: { pagination },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Users API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch users',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const validationResult = userValidations.createUser.safeParse(body);

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

    const { password, ...userData } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 409 });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const bcrypt = require('bcryptjs');
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const user = await db.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 201 });

  } catch (error: any) {
    console.error('Create user API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to create user',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}