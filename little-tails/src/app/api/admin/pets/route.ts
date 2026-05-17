import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { registrationNo: { contains: search, mode: 'insensitive' as const } },
            { breed: { contains: search, mode: 'insensitive' as const } },
            { owner: { phone: { contains: search, mode: 'insensitive' as const } } },
            { owner: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
          isActive: true,
        }
      : { isActive: true };

    const pets = await prisma.pet.findMany({
      where,
      include: {
        owner: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        _count: {
          select: { vaccinations: true, medicalRecords: true, appointments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ pets });
  } catch (error) {
    console.error('Admin pets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
