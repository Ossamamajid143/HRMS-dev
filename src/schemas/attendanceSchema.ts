import { z } from 'zod';

export const createAttendanceSchema = z.object({
  body: z.object({
    employeeId: z.number().int().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
    checkInTime: z.string().datetime(),
    checkOutTime: z.string().datetime().optional().nullable(),
    status: z.string()
  })
});

export const checkInSchema = z.object({
  body: z.object({
    status: z.string().optional()
  })
});
