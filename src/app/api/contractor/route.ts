import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to check if error is database-related (table doesn't exist, connection issue, etc.)
function isDatabaseError(error: any): boolean {
  const message = error?.message || '';
  const code = error?.code || '';

  // Check for common Prisma/PostgreSQL errors
  return message.includes('does not exist') ||
         message.includes('relation') ||
         message.includes('ECONNREFUSED') ||
         message.includes('connection') ||
         code === 'P2021' ||  // Table doesn't exist
         code === 'P2010' ||  // Raw query failed
         code === 'P2002' ||  // Unique constraint
         code === 'P1001' ||  // Can't reach database
         code === 'P1002' ||  // Database timeout
         /P\d{4}/.test(code); // Any Prisma error code
}

// GET - Fetch contractor profile
export async function GET() {
  try {
    // Return null if database is not configured
    if (!prisma) {
      return NextResponse.json({ contractor: null, message: 'Database not configured. Add DATABASE_URL to enable settings.' });
    }

    // For now, get the first contractor (single-tenant)
    const contractor = await prisma.contractor.findFirst({
      include: {
        laborRates: true,
        materialMarkups: true,
        quoteSettings: true,
      },
    });

    // If no contractor exists, return null
    if (!contractor) {
      return NextResponse.json({ contractor: null });
    }

    return NextResponse.json({ contractor });
  } catch (error: any) {
    console.error('Error fetching contractor:', error);

    // Always return 200 with helpful message for any database error
    return NextResponse.json({
      contractor: null,
      message: isDatabaseError(error)
        ? 'Database tables not created yet. Run: npx prisma db push'
        : 'Database connection error. Check configuration.'
    });
  }
}

// POST - Create new contractor profile
export async function POST(request: NextRequest) {
  try {
    // Return error if database is not configured
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      companyName,
      ownerName,
      email,
      phone,
      address,
      city,
      province,
      postalCode,
      licenseNumber,
      insuranceProvider,
      insuranceAmount,
      wsibNumber,
    } = body;

    if (!companyName || !email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      );
    }

    const contractor = await prisma.contractor.create({
      data: {
        companyName,
        ownerName,
        email,
        phone,
        address,
        city,
        province,
        postalCode,
        licenseNumber,
        insuranceProvider,
        insuranceAmount,
        wsibNumber,
        // Create default labor rates
        laborRates: {
          create: [
            { workerType: 'journeyman', hourlyRate: 85 },
            { workerType: 'apprentice', hourlyRate: 45 },
            { workerType: 'helper', hourlyRate: 35 },
          ],
        },
        // Create default quote settings
        quoteSettings: {
          create: {
            overheadPercent: 15,
            travelRate: 65,
            depositPercent: 50,
            warrantyYears: 1,
            quoteValidDays: 30,
          },
        },
      },
      include: {
        laborRates: true,
        quoteSettings: true,
      },
    });

    return NextResponse.json({ contractor });
  } catch (error: any) {
    console.error('Error creating contractor:', error);

    // Return helpful error message for database errors
    const errorMessage = isDatabaseError(error)
      ? 'Database tables not created. Run: npx prisma db push'
      : 'Failed to create contractor profile. Check database configuration.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 503 }
    );
  }
}

// PUT - Update contractor profile
export async function PUT(request: NextRequest) {
  try {
    // Return error if database is not configured
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Contractor ID is required' },
        { status: 400 }
      );
    }

    const contractor = await prisma.contractor.update({
      where: { id },
      data,
      include: {
        laborRates: true,
        materialMarkups: true,
        quoteSettings: true,
      },
    });

    return NextResponse.json({ contractor });
  } catch (error) {
    console.error('Error updating contractor:', error);
    return NextResponse.json(
      { error: 'Failed to update contractor profile' },
      { status: 500 }
    );
  }
}
