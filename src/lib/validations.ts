import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().nonnegative('Stock must be non-negative'),
});

export const appointmentSchema = z.object({
  petName: z.string().min(1, 'Pet name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  service: z.string().min(1, 'Service is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
});

export type ProductInput = z.infer<typeof productSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
