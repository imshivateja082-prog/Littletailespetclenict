import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendReminderNotification } from '@/lib/whatsapp';

/**
 * Admin-only endpoint for managing all reminders
 */

// GET all reminders (admin only)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const rawReminders = await prisma.reminder.findMany({
      include: {
        pet: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: [{ isSent: 'asc' }, { dueDate: 'asc' }],
    });

    const reminders = rawReminders.map(reminder => ({
      ...reminder,
      owner: reminder.pet?.owner ?? null,
      pet: {
        id: reminder.pet.id,
        name: reminder.pet.name,
        registrationNo: reminder.pet.registrationNo,
      },
    }));

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Get all reminders error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST send specific reminder (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { reminderId } = body;

    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    }

    // Fetch the reminder with full details
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Skip if already sent
    if (reminder.isSent) {
      return NextResponse.json({ message: 'Reminder already sent' });
    }

    // Check if owner has phone number
    const owner = reminder.pet.owner;
    if (!owner.phone) {
      return NextResponse.json({ error: 'Owner phone number not available' }, { status: 400 });
    }

    // Send WhatsApp notification
    const result = await sendReminderNotification({
      ownerName: `${owner.firstName} ${owner.lastName}`,
      phone: owner.phone,
      petName: reminder.pet.name,
      reminderType: reminder.type,
      title: reminder.title,
      message: reminder.message,
      dueDate: new Date(reminder.dueDate).toLocaleDateString('en-IN'),
    });

    // Update reminder status
    if (result.success) {
      await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          isSent: true,
          sentAt: new Date(),
        },
      });

      console.log(`✅ Admin sent reminder ${reminderId} to ${owner.email}`);
      return NextResponse.json({ message: 'Reminder sent successfully', sid: result.sid });
    } else {
      const errorDetails =
        typeof result.error === 'string'
          ? result.error
          : result.error instanceof Error
          ? result.error.message
          : 'Unknown error';

      return NextResponse.json(
        { error: 'Failed to send WhatsApp reminder', details: errorDetails },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send reminder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH batch send all due reminders (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();

    // Find all unsent reminders that are due
    const dueReminders = await prisma.reminder.findMany({
      where: {
        isSent: false,
        dueDate: {
          lte: now,
        },
      },
      include: {
        pet: {
          include: {
            owner: true,
          },
        },
      },
    });

    console.log(`📊 Found ${dueReminders.length} reminders to send`);

    const results = {
      total: dueReminders.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send reminders
    for (const reminder of dueReminders) {
      try {
        const owner = reminder.pet.owner;

        if (!owner.phone) {
          console.warn(`⚠️ No phone number for user ${owner.id}`);
          results.failed++;
          results.errors.push(`No phone for ${owner.email}`);
          continue;
        }

        const result = await sendReminderNotification({
          ownerName: `${owner.firstName} ${owner.lastName}`,
          phone: owner.phone,
          petName: reminder.pet.name,
          reminderType: reminder.type,
          title: reminder.title,
          message: reminder.message,
          dueDate: new Date(reminder.dueDate).toLocaleDateString('en-IN'),
        });

        if (result.success) {
          await prisma.reminder.update({
            where: { id: reminder.id },
            data: {
              isSent: true,
              sentAt: new Date(),
            },
          });
          results.sent++;
          console.log(`✅ Reminder sent to ${owner.email}`);
        } else {
          const errorDetail =
            typeof result.error === 'string'
              ? result.error
              : result.error instanceof Error
              ? result.error.message
              : 'Unknown error';

          results.failed++;
          results.errors.push(`Failed to send to ${owner.email}: ${errorDetail}`);
          console.error(`❌ Failed to send reminder to ${owner.email}: ${errorDetail}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Error processing reminder:', error);
      }
    }

    console.log(`📊 Batch complete: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      message: 'Batch reminder processing completed',
      results,
    });
  } catch (error) {
    console.error('Batch send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE reminder (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reminderId = searchParams.get('id');

    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    }

    const reminder = await prisma.reminder.delete({
      where: { id: reminderId },
    });

    console.log(`🗑️ Admin deleted reminder ${reminderId}`);
    return NextResponse.json({ message: 'Reminder deleted', reminder });
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
