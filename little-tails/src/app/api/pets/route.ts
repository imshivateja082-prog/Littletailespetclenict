import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { petSchema } from '@/lib/validators';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const pets = await prisma.pet.findMany({
      where: { ownerId: session.userId, isActive: true },
      include: {
        vaccinations: { orderBy: { dateAdministered: 'desc' }, take: 5 },
        medicalRecords: { orderBy: { visitDate: 'desc' }, take: 5 },
        appointments: { orderBy: { date: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pets });
  } catch (error) {
    console.error('Get pets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = petSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.create({
      data: {
        ...validationResult.data,
        ownerId: session.userId,
      },
    });

    return NextResponse.json({ pet }, { status: 201 });
  } catch (error) {
    console.error('Create pet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
