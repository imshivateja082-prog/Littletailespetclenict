import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { petSchema } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const pet = await prisma.pet.findFirst({
      where: {
        id,
        ownerId: session.role === 'ADMIN' ? undefined : session.userId,
      },
      include: {
        vaccinations: { orderBy: { dateAdministered: 'desc' } },
        medicalRecords: { orderBy: { visitDate: 'desc' } },
        appointments: { orderBy: { date: 'desc' } },
        owner: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    return NextResponse.json({ pet });
  } catch (error) {
    console.error('Get pet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = petSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.updateMany({
      where: {
        id,
        ownerId: session.role === 'ADMIN' ? undefined : session.userId,
      },
      data: validationResult.data,
    });

    if (pet.count === 0) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    const updatedPet = await prisma.pet.findUnique({ where: { id } });
    return NextResponse.json({ pet: updatedPet });
  } catch (error) {
    console.error('Update pet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const pet = await prisma.pet.updateMany({
      where: {
        id,
        ownerId: session.role === 'ADMIN' ? undefined : session.userId,
      },
      data: { isActive: false },
    });

    if (pet.count === 0) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
