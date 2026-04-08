import { Router } from 'express';
import { createAttendance, getAttendance, getAttendanceByEmployeeId, checkIn, checkOut } from '../controllers/attendanceController';
import { authenticateJWT, authorizeRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateMiddleware';
import { createAttendanceSchema, checkInSchema } from '../schemas/attendanceSchema';

const router = Router();

router.use(authenticateJWT);

// Automatic attendance for current user
router.post('/check-in', validateRequest(checkInSchema), checkIn);
router.post('/check-out', checkOut);

// Admin/HR endpoints
router.post('/', authorizeRole(['Admin', 'HR']), validateRequest(createAttendanceSchema), createAttendance);
router.get('/', authorizeRole(['Admin', 'HR']), getAttendance);
router.get('/:employeeId', authorizeRole(['Admin', 'HR']), getAttendanceByEmployeeId);

export default router;
