import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendReminderNotification } from '@/lib/whatsapp';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch reminders for the user's pets
    const reminders = await prisma.reminder.findMany({
      where: {
        pet: {
          ownerId: session.userId,
        },
      },
      include: {
        pet: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
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
    const { reminderId } = body;

    if (!reminderId) {
      return NextResponse.json({ error: 'Reminder ID required' }, { status: 400 });
    }

    // Fetch the reminder with pet and owner details
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

    // Verify ownership
    if (reminder.pet.owner.id !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Skip if already sent
    if (reminder.isSent) {
      return NextResponse.json({ message: 'Reminder already sent' });
    }

    // Send WhatsApp notification
    const owner = reminder.pet.owner;
    if (!owner.phone) {
      return NextResponse.json({ error: 'Owner phone number not available' }, { status: 400 });
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

    // Update reminder as sent only if WhatsApp send was successful
    if (result.success) {
      await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          isSent: true,
          sentAt: new Date(),
        },
      });

      return NextResponse.json({ message: 'Reminder sent successfully', sid: result.sid });
    } else {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp reminder', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Send reminder error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Admin endpoint to send all due reminders (scheduled task / cron)
 * This can be called by a cron job or scheduling service
 */
export async function PATCH(request: NextRequest) {
  try {
    // Optional: Add admin authentication here if needed
    const authHeader = request.headers.get('authorization');
    const schedulerSecret = process.env.SCHEDULER_SECRET;

    if (schedulerSecret && authHeader !== `Bearer ${schedulerSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find all unsent reminders that are due (today or overdue)
    const dueReminders = await prisma.reminder.findMany({
      where: {
        isSent: false,
        dueDate: {
          lte: now, // Due date is today or in the past
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

    // Send reminders and update status
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
          results.failed++;
          results.errors.push(`Failed to send to ${owner.email}: ${result.error}`);
          console.error(`❌ Failed to send reminder to ${owner.email}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Error processing reminder:', error);
      }
    }

    return NextResponse.json({
      message: 'Reminder batch processing completed',
      results,
    });
  } catch (error) {
    console.error('Batch reminder send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
