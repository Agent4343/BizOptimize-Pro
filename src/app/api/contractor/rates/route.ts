import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch labor rates
export async function GET() {
  try {
    const contractor = await prisma.contractor.findFirst();

    if (!contractor) {
      return NextResponse.json({ rates: [] });
    }

    const rates = await prisma.laborRate.findMany({
      where: { contractorId: contractor.id },
    });

    return NextResponse.json({ rates });
  } catch (error) {
    console.error('Error fetching labor rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labor rates' },
      { status: 500 }
    );
  }
}

// PUT - Update labor rates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { rates } = body;

    if (!rates || !Array.isArray(rates)) {
      return NextResponse.json(
        { error: 'Rates array is required' },
        { status: 400 }
      );
    }

    const contractor = await prisma.contractor.findFirst();

    if (!contractor) {
      return NextResponse.json(
        { error: 'No contractor profile found. Please create one first.' },
        { status: 404 }
      );
    }

    // Update each rate
    const updatedRates = await Promise.all(
      rates.map(async (rate: { workerType: string; hourlyRate: number; overtimeRate?: number }) => {
        return prisma.laborRate.upsert({
          where: {
            contractorId_workerType: {
              contractorId: contractor.id,
              workerType: rate.workerType,
            },
          },
          update: {
            hourlyRate: rate.hourlyRate,
            overtimeRate: rate.overtimeRate,
          },
          create: {
            contractorId: contractor.id,
            workerType: rate.workerType,
            hourlyRate: rate.hourlyRate,
            overtimeRate: rate.overtimeRate,
          },
        });
      })
    );

    return NextResponse.json({ rates: updatedRates });
  } catch (error) {
    console.error('Error updating labor rates:', error);
    return NextResponse.json(
      { error: 'Failed to update labor rates' },
      { status: 500 }
    );
  }
}
