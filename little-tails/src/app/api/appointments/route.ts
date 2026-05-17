import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { appointmentSchema } from '@/lib/validators';
import { sendAppointmentBookedEmail } from '@/lib/email';
import { sendAppointmentConfirmation } from '@/lib/whatsapp';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const where = session.role === 'ADMIN' ? {} : { userId: session.userId };

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        pet: { select: { name: true, species: true, breed: true, registrationNo: true } },
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
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
    const validationResult = appointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { date, time, serviceType, petId, reason, notes } = validationResult.data;

    // Verify pet belongs to user
    const pet = await prisma.pet.findFirst({
      where: { id: petId, ownerId: session.userId },
    });

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { firstName: true, lastName: true, email: true, phone: true },
    });

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        time,
        serviceType,
        petId,
        userId: session.userId,
        reason,
        notes,
      },
      include: {
        pet: { select: { name: true, species: true, breed: true } },
      },
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: session.userId,
        title: 'Appointment Booked',
        message: `Your appointment for ${pet.name} has been booked for ${date} at ${time}.`,
        type: 'IN_APP',
      },
    });

    // Send confirmation email via Resend (non-blocking)
    if (user?.email) {
      sendAppointmentBookedEmail({
        to: user.email,
        userName: user.firstName,
        petName: pet.name,
        petSpecies: pet.species,
        serviceType,
        date,
        time,
        reason,
      }).then((result) => {
        if (result.success) {
          console.log(`📧 Appointment confirmation email sent to ${user.email}`);
        } else {
          console.error(`📧 Failed to send email to ${user.email}:`, result.error);
        }
      });
    }

    // Send WhatsApp confirmation via Twilio (non-blocking)
    if (user?.phone) {
      sendAppointmentConfirmation({
        ownerName: user.firstName,
        phone: user.phone,
        petName: pet.name,
        date,
        time,
        service: serviceType,
      }).then((result) => {
        if (result.success) {
          console.log(`📱 WhatsApp confirmation sent to ${user.phone}`);
        } else {
          console.error(`📱 Failed to send WhatsApp to ${user.phone}:`, result.error);
        }
      });
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}