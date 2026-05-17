import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendAppointmentStatusEmail } from '@/lib/email';

export async function PATCH(
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
    const { status, adminNotes, date, time } = body;

    // Admin can update status, users can only cancel their own
    if (session.role === 'ADMIN') {
      const existingAppointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          pet: { select: { id: true, name: true, species: true, breed: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        },
      });

      if (!existingAppointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(adminNotes && { adminNotes }),
          ...(date && { date: new Date(date) }),
          ...(time && { time }),
        },
        include: {
          pet: { select: { id: true, name: true, species: true, breed: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        },
      });

      // Create a reminder when the appointment is approved
      if (status === 'APPROVED' && existingAppointment.status !== 'APPROVED') {
        await prisma.reminder.create({
          data: {
            petId: appointment.pet.id,
            type: 'APPOINTMENT',
            title: `Appointment Reminder for ${appointment.pet.name}`,
            message: `Your appointment for ${appointment.pet.name} is confirmed for ${appointment.date.toLocaleDateString('en-IN')} at ${appointment.time}.`,
            dueDate: appointment.date,
          },
        });
      }

      // Auto-generate vaccination record and next due date when vaccination appointment is completed
      if (status === 'COMPLETED' && existingAppointment.serviceType === 'VACCINATION' && existingAppointment.status !== 'COMPLETED') {
        const dateAdministered = new Date(appointment.date);
        const nextDueDate = new Date(dateAdministered);
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); // Default: 1 year later

        // Create vaccination record
        await prisma.vaccination.create({
          data: {
            petId: appointment.pet.id,
            vaccineName: appointment.notes || existingAppointment.reason || 'General Vaccination',
            dateAdministered,
            nextDueDate,
            veterinarian: 'Dr. Ganesh Kumar',
            notes: `Auto-recorded from appointment. ${adminNotes || ''}`.trim(),
          },
        });

        // Create reminder for next vaccination due date
        await prisma.reminder.create({
          data: {
            petId: appointment.pet.id,
            type: 'VACCINATION',
            title: `Vaccination Due: ${appointment.pet.name}`,
            message: `${appointment.pet.name}'s next vaccination is due on ${nextDueDate.toLocaleDateString('en-IN')}. Owner: ${appointment.user!.firstName} ${appointment.user!.lastName}.`,
            dueDate: nextDueDate,
          },
        });

        // Notify the pet owner about next vaccination date
        await prisma.notification.create({
          data: {
            userId: appointment.user!.id,
            title: 'Next Vaccination Scheduled',
            message: `${appointment.pet.name}'s vaccination is complete! Next vaccination is due on ${nextDueDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}.`,
            type: 'IN_APP',
          },
        });
      }

      // Notify user about status change
      if (status && appointment.user) {
        await prisma.notification.create({
          data: {
            userId: appointment.user.id,
            title: `Appointment ${status}`,
            message: `Your appointment for ${appointment.pet.name} has been ${status.toLowerCase()}.${adminNotes ? ` Note: ${adminNotes}` : ''}`,
            type: 'IN_APP',
          },
        });

        // Send status update email via Resend (non-blocking)
        if (appointment.user.email) {
          sendAppointmentStatusEmail({
            to: appointment.user.email,
            userName: appointment.user.firstName,
            petName: appointment.pet.name,
            serviceType: appointment.serviceType,
            date: appointment.date.toISOString(),
            time: appointment.time,
            status,
            adminNotes,
          }).then((result) => {
            if (result.success) {
              console.log(`📧 Status update email sent to ${appointment.user!.email}`);
            } else {
              console.error(`📧 Failed to send status email:`, result.error);
            }
          });
        }
      }

      return NextResponse.json({ appointment });
    } else {
      // Users can only cancel their own appointments
      if (status !== 'CANCELLED') {
        return NextResponse.json({ error: 'You can only cancel appointments' }, { status: 403 });
      }

      const appointment = await prisma.appointment.updateMany({
        where: { id, userId: session.userId },
        data: { status: 'CANCELLED' },
      });

      if (appointment.count === 0) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Appointment cancelled' });
    }
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
