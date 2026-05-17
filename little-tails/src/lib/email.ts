import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface AppointmentEmailData {
  to: string;
  userName: string;
  petName: string;
  petSpecies: string;
  serviceType: string;
  date: string;
  time: string;
  reason?: string;
}

interface StatusUpdateEmailData {
  to: string;
  userName: string;
  petName: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
  adminNotes?: string;
}

const SERVICE_LABELS: Record<string, string> = {
  VACCINATION: 'Vaccination',
  GROOMING: 'Grooming',
  PET_FOOD_NUTRITION: 'Pet Food & Nutrition',
  MEDICINE: 'Medicine',
  GENERAL_CHECKUP: 'General Checkup',
  PET_ACCESSORIES: 'Pet Accessories',
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Send appointment confirmation email when a user books an appointment
 */
export async function sendAppointmentBookedEmail(data: AppointmentEmailData) {
  const service = SERVICE_LABELS[data.serviceType] || data.serviceType;

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Little Tails Pet Clinic <onboarding@resend.dev>',
      to: data.to,
      subject: `✅ Appointment Confirmed - ${service} for ${data.petName} | Little Tails Pet Clinic`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#F5F7FA;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1565C0,#42A5F5);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🐾 Little Tails Pet Clinic</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Vet Care With Heart</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px;border-left:1px solid #DDE3EC;border-right:1px solid #DDE3EC;">
      <h2 style="color:#1A2332;margin:0 0 8px;font-size:20px;">Appointment Confirmed! 🎉</h2>
      <p style="color:#5F6B7A;margin:0 0 24px;font-size:15px;">
        Hello <strong>${data.userName}</strong>, your appointment has been booked successfully.
      </p>

      <!-- Appointment Details Card -->
      <div style="background:#F5F7FA;border:1px solid #DDE3EC;border-radius:12px;padding:24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#5F6B7A;font-size:14px;width:140px;">🐾 Pet Name</td>
            <td style="padding:8px 0;color:#1A2332;font-size:14px;font-weight:600;">${data.petName} (${data.petSpecies})</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#5F6B7A;font-size:14px;">🩺 Service</td>
            <td style="padding:8px 0;color:#1565C0;font-size:14px;font-weight:600;">${service}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#5F6B7A;font-size:14px;">📅 Date</td>
            <td style="padding:8px 0;color:#1A2332;font-size:14px;font-weight:600;">${formatDate(data.date)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#5F6B7A;font-size:14px;">⏰ Time</td>
            <td style="padding:8px 0;color:#1A2332;font-size:14px;font-weight:600;">${formatTime(data.time)}</td>
          </tr>
          ${data.reason ? `
          <tr>
            <td style="padding:8px 0;color:#5F6B7A;font-size:14px;">📝 Reason</td>
            <td style="padding:8px 0;color:#1A2332;font-size:14px;">${data.reason}</td>
          </tr>` : ''}
        </table>
      </div>

      <!-- Status Badge -->
      <div style="text-align:center;margin-bottom:24px;">
        <span style="display:inline-block;background:#FFF8E1;color:#F57F17;padding:8px 20px;border-radius:8px;font-size:13px;font-weight:600;border:1px solid #FFE082;">
          ⏳ Status: PENDING — Awaiting confirmation from Dr. Ganesh Kumar
        </span>
      </div>

      <!-- Clinic Info -->
      <div style="background:#EBF5FB;border:1px solid #BBDEFB;border-radius:12px;padding:20px;margin-bottom:24px;">
        <h3 style="color:#1565C0;margin:0 0 12px;font-size:15px;">📍 Clinic Details</h3>
        <p style="color:#5F6B7A;margin:4px 0;font-size:13px;"><strong>Dr. Ganesh Kumar</strong> (B.V.Sc & A.H)</p>
        <p style="color:#5F6B7A;margin:4px 0;font-size:13px;">📍 Near Adarsh Nagar Gate, Zaheerabad, Telangana</p>
        <p style="color:#5F6B7A;margin:4px 0;font-size:13px;">📞 <a href="tel:7013127334" style="color:#1565C0;text-decoration:none;">7013127334</a></p>
      </div>

      <p style="color:#5F6B7A;font-size:13px;margin:0;">
        If you need to reschedule or cancel, please log in to your dashboard or call us directly.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#F5F7FA;border:1px solid #DDE3EC;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
      <p style="color:#5F6B7A;margin:0;font-size:12px;">
        © ${new Date().getFullYear()} Little Tails Pet Clinic, Zaheerabad | Committed to Pet Wellness 🐾
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      if ('statusCode' in error && error.statusCode === 403) {
        console.warn(`⚠️ Resend free tier: Cannot send email to ${data.to}. Only your account email is allowed. Verify a domain at resend.com/domains to send to all users.`);
      } else {
        console.error('Resend email error:', error);
      }
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Send email failed:', error);
    return { success: false, error };
  }
}

/**
 * Send email when admin updates appointment status (approved, rejected, etc.)
 */
export async function sendAppointmentStatusEmail(data: StatusUpdateEmailData) {
  const service = SERVICE_LABELS[data.serviceType] || data.serviceType;

  const statusConfig: Record<string, { emoji: string; color: string; bgColor: string; borderColor: string; message: string }> = {
    APPROVED: {
      emoji: '✅',
      color: '#2E7D32',
      bgColor: '#E8F5E9',
      borderColor: '#A5D6A7',
      message: 'Your appointment has been approved by Dr. Ganesh Kumar.',
    },
    REJECTED: {
      emoji: '❌',
      color: '#C62828',
      bgColor: '#FFEBEE',
      borderColor: '#EF9A9A',
      message: 'Unfortunately, your appointment could not be confirmed. Please contact us to reschedule.',
    },
    COMPLETED: {
      emoji: '🎉',
      color: '#1565C0',
      bgColor: '#E3F2FD',
      borderColor: '#90CAF9',
      message: 'Your appointment has been completed. Thank you for visiting Little Tails Pet Clinic!',
    },
    RESCHEDULED: {
      emoji: '🔄',
      color: '#E65100',
      bgColor: '#FFF3E0',
      borderColor: '#FFCC80',
      message: 'Your appointment has been rescheduled. Please check the updated date and time below.',
    },
  };

  const config = statusConfig[data.status] || {
    emoji: 'ℹ️',
    color: '#5F6B7A',
    bgColor: '#F5F7FA',
    borderColor: '#DDE3EC',
    message: `Your appointment status has been updated to ${data.status}.`,
  };

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Little Tails Pet Clinic <onboarding@resend.dev>',
      to: data.to,
      subject: `${config.emoji} Appointment ${data.status} - ${data.petName} | Little Tails Pet Clinic`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#F5F7FA;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1565C0,#42A5F5);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🐾 Little Tails Pet Clinic</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Vet Care With Heart</p>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px;border-left:1px solid #DDE3EC;border-right:1px solid #DDE3EC;">
      <h2 style="color:#1A2332;margin:0 0 8px;font-size:20px;">Appointment Update ${config.emoji}</h2>
      <p style="color:#5F6B7A;margin:0 0 24px;font-size:15px;">
        Hello <strong>${data.userName}</strong>, ${config.message}
      </p>

      <!-- Status Badge -->
      <div style="text-align:center;margin-bottom:24px;">
        <span style="display:inline-block;background:${config.bgColor};color:${config.color};padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;border:1px solid ${config.borderColor};">
          ${config.emoji} ${data.status}
        </span>
      </div>

      <!-- Appointment Details -->
      <div style="background:#F5F7FA;border:1px solid #DDE3EC;border-radius:12px;padding:24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#5F6B7A;font-size:14px;width:140px;">🐾 Pet</td>
            <td style="padding:8px 0;color:#1A2332;font-size:14px;font-weight:600;">${data.petName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#5F6B7A;font-size:14px;">🩺 Service</td>
            <td style="padding:8px 0;color:#1565C0;font-size:14px;font-weight:600;">${service}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#5F6B7A;font-size:14px;">📅 Date</td>
            <td style="padding:8px 0;color:#1A2332;font-size:14px;font-weight:600;">${formatDate(data.date)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#5F6B7A;font-size:14px;">⏰ Time</td>
            <td style="padding:8px 0;color:#1A2332;font-size:14px;font-weight:600;">${formatTime(data.time)}</td>
          </tr>
        </table>
      </div>

      ${data.adminNotes ? `
      <!-- Admin Notes -->
      <div style="background:#EBF5FB;border:1px solid #BBDEFB;border-radius:12px;padding:16px;margin-bottom:24px;">
        <p style="color:#1565C0;margin:0 0 4px;font-size:13px;font-weight:600;">📝 Note from Dr. Ganesh Kumar:</p>
        <p style="color:#5F6B7A;margin:0;font-size:14px;">${data.adminNotes}</p>
      </div>
      ` : ''}

      <!-- Clinic Info -->
      <div style="background:#EBF5FB;border:1px solid #BBDEFB;border-radius:12px;padding:20px;">
        <p style="color:#5F6B7A;margin:4px 0;font-size:13px;">📍 Near Adarsh Nagar Gate, Zaheerabad</p>
        <p style="color:#5F6B7A;margin:4px 0;font-size:13px;">📞 <a href="tel:7013127334" style="color:#1565C0;text-decoration:none;">7013127334</a></p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F5F7FA;border:1px solid #DDE3EC;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
      <p style="color:#5F6B7A;margin:0;font-size:12px;">
        © ${new Date().getFullYear()} Little Tails Pet Clinic, Zaheerabad | Committed to Pet Wellness 🐾
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      if ('statusCode' in error && error.statusCode === 403) {
        console.warn(`⚠️ Resend free tier: Cannot send status email to ${data.to}. Only your account email is allowed. Verify a domain at resend.com/domains to send to all users.`);
      } else {
        console.error('Resend status email error:', error);
      }
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Send status email failed:', error);
    return { success: false, error };
  }
}
