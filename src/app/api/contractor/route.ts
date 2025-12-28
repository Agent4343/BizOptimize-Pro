import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch contractor profile
export async function GET() {
  try {
    // Return null if database is not configured
    if (!prisma) {
      return NextResponse.json({ contractor: null, message: 'Database not configured' });
    }

    // For now, get the first contractor (single-tenant)
    // In production, you'd use auth to get the current user's contractor
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
  } catch (error) {
    console.error('Error fetching contractor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contractor profile' },
      { status: 500 }
    );
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
  } catch (error) {
    console.error('Error creating contractor:', error);
    return NextResponse.json(
      { error: 'Failed to create contractor profile' },
      { status: 500 }
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
