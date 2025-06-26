import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUtils } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'basic' } = body;
    
    // Apply database seed based on type
    await DatabaseUtils.seed();
    
    return NextResponse.json({
      success: true,
      message: 'Sample data loaded successfully',
      data: {
        type,
        loaded: true,
      }
    });
  } catch (error: any) {
    console.error('Seeding failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to load sample data',
      error: error.message,
    }, { status: 500 });
  }
}