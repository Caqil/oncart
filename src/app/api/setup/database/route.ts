import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUtils } from '@/lib/db';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Test database connection
    await db.$connect();
    
    // Apply migrations
    await DatabaseUtils.migrate();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      data: {
        connected: true,
        migrationsApplied: true,
      }
    });
  } catch (error: any) {
    console.error('Database setup failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database setup failed',
      error: error.message,
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check database connection and status
    await db.$connect();
    
    const tableCount = await db.$queryRaw`
      SELECT COUNT(*) as count 
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `;
    
    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        tableCount: (tableCount as any)[0]?.count || 0,
        status: 'ready'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Database not ready',
      error: error.message,
    }, { status: 500 });
  }
}