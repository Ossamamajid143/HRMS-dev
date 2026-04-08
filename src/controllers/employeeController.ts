import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { employees } from '../db/schema';
import { eq, ilike, or, SQL } from 'drizzle-orm';

export const createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, department } = req.body;

    const existingUser = await db.select().from(employees).where(eq(employees.email, email)).limit(1);
    if (existingUser.length > 0) {
       res.status(400).json({ message: 'Email already in use' });
       return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.insert(employees).values({
      name,
      email,
      passwordHash,
      role,
      department
    }).returning({
      id: employees.id,
      name: employees.name,
      email: employees.email,
      role: employees.role,
      department: employees.department
    });

    res.status(201).json({ message: 'Employee created successfully', employee: newUser[0] });
  } catch (error) {
    next(error);
  }
};

export const getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    const query = db.select({
      id: employees.id,
      name: employees.name,
      email: employees.email,
      role: employees.role,
      department: employees.department,
      createdAt: employees.createdAt
    }).from(employees);

    let condition: SQL | undefined;
    if (search) {
      condition = or(
        ilike(employees.name, `%${search}%`),
        ilike(employees.email, `%${search}%`)
      );
    }
    
    if (condition) {
      query.where(condition);
    }

    const paginatedEmployees = await query.limit(limit).offset(offset);
    
    res.json({
      page,
      limit,
      data: paginatedEmployees
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const employeeRows = await db.select({
      id: employees.id,
      name: employees.name,
      email: employees.email,
      role: employees.role,
      department: employees.department,
      createdAt: employees.createdAt
    }).from(employees).where(eq(employees.id, Number(id))).limit(1);

    if (employeeRows.length === 0) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    res.json(employeeRows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, department } = req.body;

    const existing = await db.select().from(employees).where(eq(employees.id, Number(id))).limit(1);
    if (existing.length === 0) {
       res.status(404).json({ message: 'Employee not found' });
       return;
    }

    const updated = await db.update(employees).set({
      name: name ?? existing[0].name,
      role: role ?? existing[0].role,
      department: department ?? existing[0].department,
    }).where(eq(employees.id, Number(id))).returning({
      id: employees.id,
      name: employees.name,
      email: employees.email,
      role: employees.role,
      department: employees.department,
    });

    res.json({ message: 'Employee updated', employee: updated[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await db.select().from(employees).where(eq(employees.id, Number(id))).limit(1);
    if (existing.length === 0) {
       res.status(404).json({ message: 'Employee not found' });
       return;
    }

    await db.delete(employees).where(eq(employees.id, Number(id)));

    res.json({ message: 'Employee deleted' });
  } catch (error) {
    next(error);
  }
};
