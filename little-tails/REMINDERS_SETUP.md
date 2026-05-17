# WhatsApp Reminders Setup Guide 🐾

## What's Fixed ✅

Your WhatsApp reminder notifications weren't working because:

1. **No WhatsApp reminder function** - Only appointment confirmations were implemented
2. **No API endpoint for reminders** - No way to fetch and send due reminders
3. **No automated sending** - No system to automatically check and send reminders

---

## New Features Added 🚀

### 1. **WhatsApp Reminder Function** (`src/lib/whatsapp.ts`)
```typescript
sendReminderNotification(data: ReminderData)
```
- Sends formatted WhatsApp messages for reminders
- Supports multiple reminder types: VACCINATION, APPOINTMENT, HEALTH_CHECKUP, MEDICATION
- Includes emoji indicators and formatted dates

### 2. **Reminders API Endpoint** (`src/app/api/reminders/route.ts`)

#### GET `/api/reminders`
Fetch all reminders for the current user's pets
```json
{
  "reminders": [
    {
      "id": "reminder-id",
      "type": "VACCINATION",
      "title": "Vaccination Due",
      "message": "Your pet needs a vaccination",
      "dueDate": "2026-05-20",
      "isSent": false,
      "pet": { "id": "pet-id", "name": "Buddy" }
    }
  ]
}
```

#### POST `/api/reminders`
Send a specific reminder via WhatsApp
```json
{
  "reminderId": "reminder-id"
}
```

**Response:**
```json
{
  "message": "Reminder sent successfully",
  "sid": "twilio-message-sid"
}
```

#### PATCH `/api/reminders` (Admin/Cron)
Send all due reminders (batch processing)

**Headers:**
```
Authorization: Bearer YOUR_SCHEDULER_SECRET
```

**Response:**
```json
{
  "results": {
    "total": 5,
    "sent": 4,
    "failed": 1,
    "errors": ["Error details here"]
  }
}
```

### 3. **Updated Reminders Dashboard** (`src/app/dashboard/reminders/page.tsx`)
- Display all health reminders for user's pets
- Show reminder status (Sent/Unsent)
- **Manual Send button**: Click "📱 Send WhatsApp" to send any reminder immediately
- Sort by due date

---

## How to Use 📱

### Manual Reminder Sending
1. Go to Dashboard → Reminders & Notifications
2. Scroll to "⏰ Health Reminders (WhatsApp)" section
3. Click **"📱 Send WhatsApp"** button on any unsent reminder
4. The reminder will be sent to the pet owner's WhatsApp immediately

### Automatic Reminder Sending (Scheduled)

Choose one of these options:

#### Option A: Using Vercel Cron (Recommended for Vercel deployments)
1. Create `src/app/api/cron/send-reminders/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/reminders`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.SCHEDULER_SECRET}`,
    },
  });

  return NextResponse.json({ success: true });
}
```

2. Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

#### Option B: Using External Cron Service (EasyCron, etc.)
1. Set environment variable:
```
SCHEDULER_SECRET=your-secret-token-here
```

2. Create scheduled request to:
```
POST http://your-domain.com/api/reminders
Headers: Authorization: Bearer your-secret-token-here
```

3. Configure to run daily at 8 AM (or your preferred time)

#### Option C: Using Node.js Cron in a Separate Service
Install package:
```bash
npm install node-cron axios
```

Create `scripts/reminder-cron.js`:
```javascript
import cron from 'node-cron';
import axios from 'axios';

// Run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
  try {
    const response = await axios.patch(
      `${process.env.APP_URL}/api/reminders`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${process.env.SCHEDULER_SECRET}`,
        },
      }
    );
    console.log('✅ Reminders sent:', response.data.results);
  } catch (error) {
    console.error('❌ Error sending reminders:', error);
  }
});
```

Run with:
```bash
node scripts/reminder-cron.js
```

---

## Environment Variables Setup 🔑

Add these to your `.env` file:

```env
# Twilio WhatsApp (already configured)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Scheduler (NEW)
SCHEDULER_SECRET=your-super-secret-token-here
CRON_SECRET=your-cron-secret-token

# Application
NEXTAUTH_URL=http://localhost:3000
```

---

## Testing 🧪

### Test Manual Sending
1. Create a test reminder in the database or via admin panel
2. Go to Dashboard → Reminders & Notifications
3. Click "📱 Send WhatsApp" button
4. Check if WhatsApp message is received

### Test Batch Sending
```bash
curl -X PATCH http://localhost:3000/api/reminders \
  -H "Authorization: Bearer your-scheduler-secret" \
  -H "Content-Type: application/json"
```

### Test via Node Script
```bash
node -e "
fetch('http://localhost:3000/api/reminders', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer test-secret'
  }
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))
"
```

---

## Troubleshooting 🔧

### "WhatsApp credentials not configured" error
- ✅ Check `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` in `.env`
- ✅ Restart development server: `npm run dev`

### "Owner phone number not available" error
- ✅ Ensure user profile has a phone number
- ✅ Go to profile settings and add phone number

### Reminders not sending automatically
- ✅ Check if cron job is configured and running
- ✅ Verify `SCHEDULER_SECRET` is set correctly
- ✅ Check server logs for errors
- ✅ Ensure reminders have `dueDate` <= today

### Message sending fails but no clear error
- ✅ Check Twilio account balance and quota
- ✅ Verify WhatsApp number is in format: `+1234567890` (with country code)
- ✅ Check Twilio console for delivery status

---

## Database Schema Update 📊

The `Reminder` model already exists in your schema with:
- `type`: VACCINATION, APPOINTMENT, HEALTH_CHECKUP, MEDICATION
- `title`: Display title
- `message`: Full message text
- `dueDate`: When the reminder is due
- `isSent`: Whether WhatsApp was sent
- `sentAt`: Timestamp of sending

---

## Example Reminder Data 📝

Here's an example of creating a reminder in the database:

```sql
INSERT INTO reminders (id, type, title, message, "dueDate", "isSent", "petId", "createdAt") 
VALUES (
  gen_random_uuid(),
  'VACCINATION',
  'Vaccination Due - Rabies',
  'Your pet Buddy is due for a rabies vaccination. Please schedule an appointment with our clinic.',
  '2026-05-20',
  false,
  'pet-id-here',
  NOW()
);
```

---

## Summary 📋

✅ **Manual sending**: Dashboard button (immediate)
✅ **Batch sending**: API endpoint `/api/reminders` (PATCH)
✅ **Automated**: Configure cron job to send daily

**Next Steps:**
1. Test manual reminder sending first
2. Choose a cron service (Vercel, EasyCron, or Node)
3. Configure environment variables
4. Set up automated daily sends at 8 AM

---

**Questions?** Check the console logs for detailed error messages or test endpoints directly! 🚀
