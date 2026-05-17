import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const pet = await prisma.pet.findFirst({
      where: { id, isActive: true },
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

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    return NextResponse.json({ pet });
  } catch (error) {
    console.error('Get pet details error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { weight, allergies, complications } = body;
    const { id } = await params;

    const pet = await prisma.pet.update({
      where: { id },
      data: {
        ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
        ...(allergies !== undefined && { allergies }),
        ...(complications !== undefined && { complications }),
      },
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
    console.error('Update pet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
