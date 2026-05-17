import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.chatMessage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const adminPassword = await bcrypt.hash('Test@1234', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'littletailspetclinic@gmail.com',
      password: adminPassword,
      firstName: 'Dr. ganesh',
      lastName: 'kumar',
      phone: '+917013127334',
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Users
  const userPassword = await bcrypt.hash('password123', 12);

  const user1 = await prisma.user.create({
    data: {
      email: 'user@littletails.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-200-0001',
      emailVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: userPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1-555-200-0002',
      emailVerified: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'mike@example.com',
      password: userPassword,
      firstName: 'Mike',
      lastName: 'Wilson',
      phone: '+1-555-200-0003',
      emailVerified: true,
    },
  });

  console.log('✅ Users created');

  // Create Pets
  const pet1 = await prisma.pet.create({
    data: {
      name: 'Buddy',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      weight: 30.5,
      gender: 'MALE',
      color: 'Golden',
      allergies: 'Chicken-based foods',
      ownerId: user1.id,
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Persian',
      age: 5,
      weight: 4.2,
      gender: 'FEMALE',
      color: 'White',
      complications: 'Prone to hairballs',
      ownerId: user1.id,
    },
  });

  const pet3 = await prisma.pet.create({
    data: {
      name: 'Max',
      species: 'Dog',
      breed: 'German Shepherd',
      age: 2,
      weight: 35.0,
      gender: 'MALE',
      color: 'Black & Tan',
      ownerId: user2.id,
    },
  });

  const pet4 = await prisma.pet.create({
    data: {
      name: 'Luna',
      species: 'Cat',
      breed: 'Siamese',
      age: 1,
      weight: 3.8,
      gender: 'FEMALE',
      color: 'Cream & Brown',
      ownerId: user2.id,
    },
  });

  const pet5 = await prisma.pet.create({
    data: {
      name: 'Rocky',
      species: 'Dog',
      breed: 'Bulldog',
      age: 4,
      weight: 25.0,
      gender: 'MALE',
      color: 'Brindle',
      complications: 'Breathing issues, monitor during exercise',
      ownerId: user3.id,
    },
  });

  console.log('✅ Pets created');

  // Create Vaccinations
  await prisma.vaccination.createMany({
    data: [
      {
        petId: pet1.id,
        vaccineName: 'Rabies',
        dateAdministered: new Date('2024-01-15'),
        nextDueDate: new Date('2025-01-15'),
        veterinarian: 'Dr. Sarah Johnson',
        batchNumber: 'RAB-2024-001',
      },
      {
        petId: pet1.id,
        vaccineName: 'DHPP (Distemper)',
        dateAdministered: new Date('2024-03-20'),
        nextDueDate: new Date('2025-03-20'),
        veterinarian: 'Dr. Sarah Johnson',
        batchNumber: 'DHPP-2024-015',
      },
      {
        petId: pet2.id,
        vaccineName: 'Rabies',
        dateAdministered: new Date('2024-02-10'),
        nextDueDate: new Date('2025-02-10'),
        veterinarian: 'Dr. Sarah Johnson',
      },
      {
        petId: pet2.id,
        vaccineName: 'FVRCP (Feline Distemper)',
        dateAdministered: new Date('2024-02-10'),
        nextDueDate: new Date('2025-02-10'),
        veterinarian: 'Dr. Sarah Johnson',
      },
      {
        petId: pet3.id,
        vaccineName: 'Rabies',
        dateAdministered: new Date('2024-06-01'),
        nextDueDate: new Date('2025-06-01'),
        veterinarian: 'Dr. Sarah Johnson',
      },
      {
        petId: pet5.id,
        vaccineName: 'Bordetella',
        dateAdministered: new Date('2024-04-15'),
        nextDueDate: new Date('2025-04-15'),
        veterinarian: 'Dr. Sarah Johnson',
      },
    ],
  });
  console.log('✅ Vaccinations created');

  // Create Medical Records
  await prisma.medicalRecord.createMany({
    data: [
      {
        petId: pet1.id,
        diagnosis: 'Ear Infection',
        treatment: 'Antibiotic ear drops, 7-day course',
        prescription: 'Otomax Otic - 2 drops, 2x daily',
        veterinarian: 'Dr. Sarah Johnson',
        visitDate: new Date('2024-05-10'),
        followUpDate: new Date('2024-05-24'),
      },
      {
        petId: pet2.id,
        diagnosis: 'Annual Wellness Exam',
        treatment: 'General checkup - all vitals normal',
        veterinarian: 'Dr. Sarah Johnson',
        visitDate: new Date('2024-04-15'),
        notes: 'Healthy weight, good coat condition',
      },
      {
        petId: pet5.id,
        diagnosis: 'Skin Allergy',
        treatment: 'Antihistamine therapy, medicated shampoo',
        prescription: 'Apoquel 5.4mg - 1x daily',
        veterinarian: 'Dr. Sarah Johnson',
        visitDate: new Date('2024-07-20'),
        followUpDate: new Date('2024-08-20'),
        notes: 'Monitor for improvement, may need allergy testing',
      },
    ],
  });
  console.log('✅ Medical records created');

  // Create Appointments
  const now = new Date();
  await prisma.appointment.createMany({
    data: [
      {
        userId: user1.id,
        petId: pet1.id,
        date: new Date(now.getTime() + 2 * 86400000),
        time: '10:00',
        serviceType: 'GENERAL_CHECKUP',
        status: 'PENDING',
        reason: 'Annual checkup',
      },
      {
        userId: user1.id,
        petId: pet2.id,
        date: new Date(now.getTime() + 5 * 86400000),
        time: '14:00',
        serviceType: 'GROOMING',
        status: 'APPROVED',
        reason: 'Regular grooming session',
      },
      {
        userId: user2.id,
        petId: pet3.id,
        date: new Date(now.getTime() + 3 * 86400000),
        time: '09:30',
        serviceType: 'VACCINATION',
        status: 'PENDING',
        reason: 'Booster vaccination',
      },
      {
        userId: user2.id,
        petId: pet4.id,
        date: new Date(now.getTime() - 7 * 86400000),
        time: '11:00',
        serviceType: 'GENERAL_CHECKUP',
        status: 'COMPLETED',
        reason: 'Kitten wellness check',
        adminNotes: 'Healthy kitten, all vitals normal. Schedule next visit in 3 months.',
      },
      {
        userId: user3.id,
        petId: pet5.id,
        date: new Date(now.getTime() + 1 * 86400000),
        time: '15:00',
        serviceType: 'MEDICINE',
        status: 'PENDING',
        reason: 'Medication refill for skin allergy',
      },
      {
        userId: user1.id,
        petId: pet1.id,
        date: new Date(now.getTime() - 30 * 86400000),
        time: '10:00',
        serviceType: 'VACCINATION',
        status: 'COMPLETED',
        reason: 'Annual rabies vaccination',
      },
    ],
  });
  console.log('✅ Appointments created');

  // Create Medicines
  await prisma.medicine.createMany({
    data: [
      {
        name: 'Amoxicillin 250mg',
        category: 'Antibiotics',
        description: 'Broad-spectrum antibiotic for bacterial infections',
        quantity: 150,
        unit: 'capsules',
        price: 0.75,
        manufacturer: 'PetPharma Inc.',
        batchNumber: 'AMX-2024-001',
        expiryDate: new Date('2026-06-30'),
        minStock: 50,
      },
      {
        name: 'Apoquel 5.4mg',
        category: 'Anti-allergy',
        description: 'Oclacitinib for allergic dermatitis in dogs',
        quantity: 45,
        unit: 'tablets',
        price: 3.50,
        manufacturer: 'Zoetis',
        batchNumber: 'APQ-2024-012',
        expiryDate: new Date('2025-12-31'),
        minStock: 20,
      },
      {
        name: 'Heartgard Plus',
        category: 'Parasiticide',
        description: 'Heartworm prevention for dogs',
        quantity: 80,
        unit: 'tablets',
        price: 8.00,
        manufacturer: 'Boehringer Ingelheim',
        batchNumber: 'HGP-2024-005',
        expiryDate: new Date('2026-03-31'),
        minStock: 30,
      },
      {
        name: 'Frontline Plus',
        category: 'Parasiticide',
        description: 'Flea and tick prevention',
        quantity: 5,
        unit: 'vials',
        price: 15.00,
        manufacturer: 'Merial',
        batchNumber: 'FLP-2024-008',
        expiryDate: new Date('2025-09-30'),
        minStock: 15,
      },
      {
        name: 'Metacam 1.5mg/ml',
        category: 'Anti-inflammatory',
        description: 'Meloxicam oral suspension for pain management',
        quantity: 25,
        unit: 'bottles',
        price: 22.00,
        manufacturer: 'Boehringer Ingelheim',
        batchNumber: 'MCM-2024-003',
        expiryDate: new Date('2025-11-30'),
        minStock: 10,
      },
      {
        name: 'Cerenia 16mg',
        category: 'Anti-emetic',
        description: 'Maropitant for nausea and vomiting',
        quantity: 60,
        unit: 'tablets',
        price: 5.25,
        manufacturer: 'Zoetis',
        batchNumber: 'CRN-2024-007',
        expiryDate: new Date('2026-08-31'),
        minStock: 20,
      },
      {
        name: 'Otomax Otic',
        category: 'Ear Treatment',
        description: 'Ear drops for otitis externa',
        quantity: 8,
        unit: 'tubes',
        price: 28.00,
        manufacturer: 'Elanco',
        batchNumber: 'OTM-2024-002',
        expiryDate: new Date('2025-07-31'),
        minStock: 10,
      },
    ],
  });
  console.log('✅ Medicines created');

  // Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: user1.id,
        title: 'Appointment Booked',
        message: 'Your appointment for Buddy has been booked for a general checkup.',
        type: 'IN_APP',
      },
      {
        userId: user1.id,
        title: 'Vaccination Reminder',
        message: 'Buddy\'s DHPP booster is due next month. Please schedule an appointment.',
        type: 'IN_APP',
      },
      {
        userId: user2.id,
        title: 'Appointment Completed',
        message: 'Luna\'s wellness checkup is complete. All vitals are normal.',
        type: 'IN_APP',
        isRead: true,
      },
      {
        userId: user3.id,
        title: 'Medication Reminder',
        message: 'Rocky\'s Apoquel prescription needs refilling soon.',
        type: 'IN_APP',
      },
    ],
  });
  console.log('✅ Notifications created');

  // Create Reminders
  await prisma.reminder.createMany({
    data: [
      {
        petId: pet1.id,
        type: 'VACCINATION',
        title: 'DHPP Booster Due',
        message: 'Buddy needs his annual DHPP booster vaccination.',
        dueDate: new Date('2025-03-20'),
      },
      {
        petId: pet2.id,
        type: 'VACCINATION',
        title: 'Rabies Vaccine Due',
        message: 'Whiskers\' rabies vaccination is due for renewal.',
        dueDate: new Date('2025-02-10'),
      },
      {
        petId: pet3.id,
        type: 'HEALTH_CHECKUP',
        title: 'Annual Wellness Exam',
        message: 'Max is due for his annual wellness examination.',
        dueDate: new Date(now.getTime() + 14 * 86400000),
      },
      {
        petId: pet5.id,
        type: 'MEDICATION',
        title: 'Allergy Medication Refill',
        message: 'Rocky needs his Apoquel prescription refilled.',
        dueDate: new Date(now.getTime() + 3 * 86400000),
      },
    ],
  });
  console.log('✅ Reminders created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('   Admin: littletailspetclinic@gmail.com / Test@1234');
  console.log('   User:  user@littletails.com / password123');
  console.log('   User:  jane@example.com / password123');
  console.log('   User:  mike@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
