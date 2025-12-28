import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch quote settings
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ settings: null, message: 'Database not configured' });
    }

    const contractor = await prisma.contractor.findFirst();

    if (!contractor) {
      return NextResponse.json({ settings: null });
    }

    const settings = await prisma.quoteSettings.findUnique({
      where: { contractorId: contractor.id },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching quote settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote settings' },
      { status: 500 }
    );
  }
}

// PUT - Update quote settings
export async function PUT(request: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured. Please set DATABASE_URL environment variable.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      overheadPercent,
      travelRate,
      travelMinimum,
      depositPercent,
      paymentTerms,
      warrantyYears,
      warrantyTerms,
      quoteValidDays,
      customTerms,
    } = body;

    const contractor = await prisma.contractor.findFirst();

    if (!contractor) {
      return NextResponse.json(
        { error: 'No contractor profile found. Please create one first.' },
        { status: 404 }
      );
    }

    const settings = await prisma.quoteSettings.upsert({
      where: { contractorId: contractor.id },
      update: {
        overheadPercent,
        travelRate,
        travelMinimum,
        depositPercent,
        paymentTerms,
        warrantyYears,
        warrantyTerms,
        quoteValidDays,
        customTerms,
      },
      create: {
        contractorId: contractor.id,
        overheadPercent: overheadPercent ?? 15,
        travelRate: travelRate ?? 65,
        travelMinimum: travelMinimum ?? 0,
        depositPercent: depositPercent ?? 50,
        paymentTerms: paymentTerms ?? 'Balance due upon completion',
        warrantyYears: warrantyYears ?? 1,
        warrantyTerms,
        quoteValidDays: quoteValidDays ?? 30,
        customTerms,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating quote settings:', error);
    return NextResponse.json(
      { error: 'Failed to update quote settings' },
      { status: 500 }
    );
  }
}
