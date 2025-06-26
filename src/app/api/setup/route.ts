import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { DatabaseUtils } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SETUP_ERROR_MESSAGES, SETUP_SUCCESS_MESSAGES } from '@/lib/constants';

const SetupSchema = z.object({
  admin: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  settings: z.object({
    siteName: z.string().min(1, 'Site name is required'),
    siteUrl: z.string().url('Invalid site URL'),
    currency: z.string().min(3, 'Invalid currency code'),
    language: z.string().min(2, 'Invalid language code'),
    timezone: z.string().min(1, 'Timezone is required'),
  }),
  sampleData: z.object({
    enabled: z.boolean(),
    type: z.enum(['basic', 'demo', 'full']).optional(),
  }).optional(),
});

// Check if setup is already completed
export async function GET() {
  try {
    const adminExists = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    const setupCompleted = await db.setting.findUnique({
      where: { key: 'setup_completed' }
    });

    return NextResponse.json({
      success: true,
      data: {
        completed: !!adminExists && setupCompleted?.value === 'true',
        adminExists: !!adminExists,
        setupCompleted: setupCompleted?.value === 'true',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to check setup status',
      error: error.message,
    }, { status: 500 });
  }
}

// Complete setup process
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SetupSchema.parse(body);

    // Check if setup is already completed
    const existingAdmin = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: SETUP_ERROR_MESSAGES.ADMIN_ALREADY_EXISTS,
      }, { status: 400 });
    }

    // Start transaction for setup
    const result = await db.$transaction(async (tx) => {
      // 1. Create Super Admin
      const hashedPassword = await bcrypt.hash(validatedData.admin.password, 12);
      
      const admin = await tx.user.create({
        data: {
          name: validatedData.admin.name,
          email: validatedData.admin.email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          provider: 'CREDENTIALS',
          emailVerified: new Date(),
        },
      });

      // 2. Create system settings
      const settings = [
        { key: 'site_name', value: validatedData.settings.siteName, type: 'STRING' },
        { key: 'site_url', value: validatedData.settings.siteUrl, type: 'STRING' },
        { key: 'default_currency', value: validatedData.settings.currency, type: 'STRING' },
        { key: 'default_language', value: validatedData.settings.language, type: 'STRING' },
        { key: 'timezone', value: validatedData.settings.timezone, type: 'STRING' },
        { key: 'setup_completed', value: 'true', type: 'BOOLEAN' },
        { key: 'setup_completed_at', value: new Date().toISOString(), type: 'STRING' },
        { key: 'setup_version', value: '1.0.0', type: 'STRING' },
      ];

      await tx.setting.createMany({ data: settings });

      // 3. Create default currencies
      const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$', isDefault: validatedData.settings.currency === 'USD' },
        { code: 'EUR', name: 'Euro', symbol: '€', isDefault: validatedData.settings.currency === 'EUR' },
        { code: 'GBP', name: 'British Pound', symbol: '£', isDefault: validatedData.settings.currency === 'GBP' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', isDefault: validatedData.settings.currency === 'JPY' },
      ];

      await tx.currency.createMany({ data: currencies });

      // 4. Create default languages
      const languages = [
        { code: 'en', name: 'English', nativeName: 'English', isDefault: validatedData.settings.language === 'en' },
        { code: 'es', name: 'Spanish', nativeName: 'Español', isDefault: validatedData.settings.language === 'es' },
        { code: 'fr', name: 'French', nativeName: 'Français', isDefault: validatedData.settings.language === 'fr' },
        { code: 'de', name: 'German', nativeName: 'Deutsch', isDefault: validatedData.settings.language === 'de' },
      ];

      await tx.language.createMany({ data: languages });

      return { admin, settingsCount: settings.length };
    });

    // 5. Load sample data if requested
    if (validatedData.sampleData?.enabled) {
      try {
        await DatabaseUtils.seed();
      } catch (seedError) {
        console.warn('Sample data loading failed:', seedError);
        // Don't fail the entire setup if sample data fails
      }
    }

    return NextResponse.json({
      success: true,
      message: SETUP_SUCCESS_MESSAGES.SETUP_COMPLETED,
      data: {
        adminId: result.admin.id,
        settingsCreated: result.settingsCount,
        setupCompleted: true,
      }
    });

  } catch (error: any) {
    console.error('Setup failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid setup data',
        errors: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: error.message || SETUP_ERROR_MESSAGES.SETUP_COMPLETION_FAILED,
    }, { status: 500 });
  }
}