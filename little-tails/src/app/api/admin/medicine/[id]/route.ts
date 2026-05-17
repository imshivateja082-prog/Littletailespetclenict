import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...body,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      },
    });

    return NextResponse.json({ medicine });
  } catch (error) {
    console.error('Update medicine error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.medicine.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Medicine deleted' });
  } catch (error) {
    console.error('Delete medicine error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
