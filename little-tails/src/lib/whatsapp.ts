import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

/**
 * Returns true if Twilio credentials look properly configured.
 * The Account SID must start with "AC" (Twilio's format) and
 * neither value should be a placeholder.
 */
function isTwilioConfigured(): boolean {
  if (!accountSid || !authToken) return false;
  if (!accountSid.startsWith('AC')) return false;
  if (accountSid.includes('your-') || authToken.includes('your-')) return false;
  return true;
}

interface AppointmentConfirmationData {
  ownerName: string;
  phone: string;
  petName: string;
  date: string;
  time: string;
  service: string;
}

interface ReminderData {
  ownerName: string;
  phone: string;
  petName: string;
  reminderType: string;
  title: string;
  message: string;
  dueDate: string;
}

/**
 * Send a WhatsApp appointment confirmation message via Twilio.
 * Fails gracefully if Twilio credentials are not configured.
 */
export async function sendAppointmentConfirmation(data: AppointmentConfirmationData): Promise<{ success: boolean; sid?: string; error?: unknown }> {
  if (!isTwilioConfigured()) {
    console.warn('⚠️ Twilio credentials not configured — skipping WhatsApp notification.');
    return { success: false, error: 'Twilio credentials not configured. Please set a valid TWILIO_ACCOUNT_SID (must start with AC) and TWILIO_AUTH_TOKEN in your .env file.' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      from: fromWhatsApp,
      to: `whatsapp:${data.phone}`,
      body: [
        `Hi ${data.ownerName}! 🐾`,
        ``,
        `Your appointment has been booked successfully!`,
        ``,
        `📅 Date: ${data.date}`,
        `⏰ Time: ${data.time}`,
        `🐶 Pet: ${data.petName}`,
        `💉 Service: ${data.service}`,
        ``,
        `📍 Near Adarsh Nagar Gate, Zaheerabad`,
        `📞 7013127334`,
        ``,
        `We look forward to seeing you!`,
        `— Little Tails Pet Clinic`,
      ].join('\n'),
    });

    console.log(`✅ WhatsApp message sent: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('❌ WhatsApp send failed:', error);
    return {
      success: false,
      error:
        typeof error === 'string'
          ? error
          : error instanceof Error
          ? error.message
          : 'Unknown Twilio error',
    };
  }
}

/**
 * Send a WhatsApp reminder notification via Twilio.
 * Used for vaccination reminders, medication reminders, checkup reminders, etc.
 */
export async function sendReminderNotification(data: ReminderData): Promise<{ success: boolean; sid?: string; error?: unknown }> {
  if (!isTwilioConfigured()) {
    console.warn('⚠️ Twilio credentials not configured — skipping WhatsApp reminder.');
    return { success: false, error: 'Twilio credentials not configured. Please set a valid TWILIO_ACCOUNT_SID (must start with AC) and TWILIO_AUTH_TOKEN in your .env file.' };
  }

  try {
    const client = twilio(accountSid, authToken);

    const getReminderEmoji = (type: string) => {
      const emojis: Record<string, string> = {
        VACCINATION: '💉',
        APPOINTMENT: '📅',
        HEALTH_CHECKUP: '🩺',
        MEDICATION: '💊',
      };
      return emojis[type] || '🔔';
    };

    const message = await client.messages.create({
      from: fromWhatsApp,
      to: `whatsapp:${data.phone}`,
      body: [
        `Hi ${data.ownerName}! 🐾`,
        ``,
        `${getReminderEmoji(data.reminderType)} Reminder: ${data.title}`,
        ``,
        `${data.message}`,
        ``,
        `📅 Due Date: ${data.dueDate}`,
        `🐶 Pet: ${data.petName}`,
        ``,
        `📍 Little Tails Pet Clinic`,
        `📞 7013127334`,
        ``,
        `Please don't forget to attend to this!`,
        `— Little Tails Pet Clinic`,
      ].join('\n'),
    });

    console.log(`✅ WhatsApp reminder sent: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('❌ WhatsApp reminder send failed:', error);
    return {
      success: false,
      error:
        typeof error === 'string'
          ? error
          : error instanceof Error
          ? error.message
          : 'Unknown Twilio error',
    };
  }
}