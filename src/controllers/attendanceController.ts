import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import { attendance } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { AuthRequest } from '../middleware/authMiddleware';

export const checkIn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employeeId = req.user!.id;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check if user already checked in today
    const existing = await db.select().from(attendance)
      .where(and(eq(attendance.employeeId, employeeId), eq(attendance.date, today)))
      .limit(1);

    if (existing.length > 0) {
      res.status(400).json({ message: 'Already checked in for today' });
      return;
    }

    const { status = 'Present' } = req.body;

    const record = await db.insert(attendance).values({
      employeeId,
      date: today,
      checkInTime: now,
      status,
    }).returning();

    res.status(201).json({ message: 'Checked in successfully', record: record[0] });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const employeeId = req.user!.id;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get today's record for this employee
    const existing = await db.select().from(attendance)
      .where(and(eq(attendance.employeeId, employeeId), eq(attendance.date, today)))
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ message: 'No check-in record found for today' });
      return;
    }

    if (existing[0].checkOutTime) {
      res.status(400).json({ message: 'Already checked out for today' });
      return;
    }

    const record = await db.update(attendance)
      .set({ checkOutTime: now })
      .where(and(eq(attendance.employeeId, employeeId), eq(attendance.date, today)))
      .returning();

    res.json({ message: 'Checked out successfully', record: record[0] });
  } catch (error) {
    next(error);
  }
};

export const createAttendance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId, date, checkInTime, checkOutTime, status } = req.body;

    const record = await db.insert(attendance).values({
      employeeId,
      date,
      checkInTime: new Date(checkInTime),
      checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
      status,
    }).returning();

    res.status(201).json({ message: 'Attendance record created successfully', record: record[0] });
  } catch (error) {
    next(error);
  }
};

export const getAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const paginatedRecords = await db.select().from(attendance)
      .orderBy(desc(attendance.date))
      .limit(limit)
      .offset(offset);

    res.json({
      page,
      limit,
      data: paginatedRecords
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceByEmployeeId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { employeeId } = req.params;
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const paginatedRecords = await db.select().from(attendance)
      .where(eq(attendance.employeeId, Number(employeeId)))
      .orderBy(desc(attendance.date))
      .limit(limit)
      .offset(offset);

    res.json({
      page,
      limit,
      data: paginatedRecords
    });
  } catch (error) {
    next(error);
  }
};
