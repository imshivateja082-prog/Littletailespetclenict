import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vaccinationId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, vaccinationId } = await params;

    await prisma.vaccination.delete({
      where: { id: vaccinationId },
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
    console.error('Delete vaccination error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
