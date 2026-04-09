import { z } from 'zod';

export const createEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.string().min(1),
    department: z.string().min(1),
  })
});

export const updateEmployeeSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    role: z.string().min(1).optional(),
    department: z.string().min(1).optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
  })
});
