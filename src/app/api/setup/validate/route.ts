import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const AdminValidationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const SettingsValidationSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteUrl: z.string().url('Invalid site URL'),
  currency: z.string().min(3, 'Invalid currency code'),
  language: z.string().min(2, 'Invalid language code'),
  timezone: z.string().min(1, 'Timezone is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { step, data } = body;

    let validation = { isValid: true, errors: {}, warnings: {} };

    switch (step) {
      case 'admin':
        try {
          AdminValidationSchema.parse(data);
          
          // Check if email already exists
          const existingUser = await db.user.findUnique({
            where: { email: data.email }
          });
          
          if (existingUser) {
            validation.isValid = false;
            validation.errors = { email: 'Email already exists' };
          }
        } catch (error: any) {
          validation.isValid = false;
          validation.errors = error.errors.reduce((acc: any, err: any) => {
            acc[err.path[0]] = err.message;
            return acc;
          }, {});
        }
        break;

      case 'settings':
        try {
          SettingsValidationSchema.parse(data);
        } catch (error: any) {
          validation.isValid = false;
          validation.errors = error.errors.reduce((acc: any, err: any) => {
            acc[err.path[0]] = err.message;
            return acc;
          }, {});
        }
        break;

      default:
        validation.isValid = false;
        validation.errors = { general: 'Invalid validation step' };
    }

    return NextResponse.json({ success: true, validation });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Validation failed',
      error: error.message,
    }, { status: 500 });
  }
}