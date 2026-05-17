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
      vaccineName,
      dateAdministered,
      nextDueDate,
      batchNumber,
      veterinarian,
      notes,
    } = body;

    if (!vaccineName || !dateAdministered) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await prisma.vaccination.create({
      data: {
        vaccineName,
        dateAdministered: new Date(dateAdministered),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        batchNumber: batchNumber || null,
        veterinarian: veterinarian || null,
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
    console.error('Add vaccination error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
