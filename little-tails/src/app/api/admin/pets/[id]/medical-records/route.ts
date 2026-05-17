import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = await params;
    const {
      patientHistory,
      diagnosis,
      treatment,
      prescription,
      veterinarian,
      visitDate,
      followUpDate,
      notes,
    } = body;

    if (!diagnosis || !treatment || !visitDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await prisma.medicalRecord.create({
      data: {
        patientHistory: patientHistory || null,
        diagnosis,
        treatment,
        prescription: prescription || null,
        veterinarian: veterinarian || null,
        visitDate: new Date(visitDate),
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        notes: notes || null,
        petId: id,
      },
    });

    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        owner: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        vaccinations: {
          orderBy: { dateAdministered: 'desc' },
        },
        medicalRecords: {
          orderBy: { visitDate: 'desc' },
        },
      },
    });

    return NextResponse.json({ pet });
  } catch (error) {
    console.error('Add medical record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
