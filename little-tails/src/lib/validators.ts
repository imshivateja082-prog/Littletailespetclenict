import { z } from 'zod';

// ==================== Auth Validators ====================
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ==================== Pet Validators ====================
export const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().min(1, 'Breed is required'),
  age: z.number().min(0, 'Age must be positive'),
  weight: z.number().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  color: z.string().optional(),
  microchipId: z.string().optional(),
  allergies: z.string().optional(),
  complications: z.string().optional(),
});

// ==================== Appointment Validators ====================
export const appointmentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  serviceType: z.enum(['VACCINATION', 'GROOMING', 'PET_FOOD_NUTRITION', 'MEDICINE', 'GENERAL_CHECKUP']),
  petId: z.string().min(1, 'Pet is required'),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// ==================== Medicine Validators ====================
export const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  price: z.number().min(0, 'Price must be positive'),
  expiryDate: z.string().optional(),
  manufacturer: z.string().optional(),
  batchNumber: z.string().optional(),
  minStock: z.number().min(0).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PetInput = z.infer<typeof petSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type MedicineInput = z.infer<typeof medicineSchema>;
