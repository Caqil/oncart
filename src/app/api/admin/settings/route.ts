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
    if (!checker.hasPermission(PERMISSIONS.SETTINGS_READ)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let where = {};
    if (category) {
      where = { category };
    }

    const settings = await db.setting.findMany({
      where,
      orderBy: { category: 'asc' }
    });

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = {
        value: setting.value,
        description: setting.description,
        type: setting.type,
        updatedAt: setting.updatedAt
      };
      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      data: groupedSettings,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Settings API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch settings',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    if (!checker.hasPermission(PERMISSIONS.SETTINGS_WRITE)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 403 });
    }

    const body = await request.json();
    const { category, settings } = body;

    if (!category || !settings) {
      return NextResponse.json({
        success: false,
        message: 'Category and settings are required',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      } as ApiResponse, { status: 400 });
    }

    // Update settings using transaction
    const updatedSettings = await db.$transaction(async (tx) => {
      const results: any[] = [];
      
      for (const [key, value] of Object.entries(settings)) {
        const result = await tx.setting.upsert({
          where: {
            category_key: {
              category,
              key
            }
          },
          update: {
            value: JSON.stringify(value),
            updatedAt: new Date(),
            updatedBy: session.user.id
          },
          create: {
            category,
            key,
            value: JSON.stringify(value),
            type: typeof value,
            createdBy: session.user.id,
            updatedBy: session.user.id
          }
        });
        results.push(result);
      }
      
      return results;
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings,
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse);

  } catch (error: any) {
    console.error('Update settings API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to update settings',
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    } as ApiResponse, { status: 500 });
  }
}