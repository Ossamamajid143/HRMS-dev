import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { employees } from '../db/schema';
import { env } from '../config/env';
import { eq } from 'drizzle-orm';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    }).returning({ id: employees.id, name: employees.name, email: employees.email });

    res.status(201).json({ message: 'User registered successfully', user: newUser[0] });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const userRows = await db.select().from(employees).where(eq(employees.email, email)).limit(1);
    const user = userRows[0];

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};
