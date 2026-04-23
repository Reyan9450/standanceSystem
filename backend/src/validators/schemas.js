const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'teacher', 'student']),
  classId: z.string().optional(),
});

const startSessionSchema = z.object({
  classId: z.string().min(1),
  subject: z.string().min(1),
});

const markAttendanceSchema = z.object({
  sessionId: z.string().min(1),
});

const manualMarkSchema = z.object({
  studentId: z.string().min(1),
  sessionId: z.string().min(1),
  status: z.enum(['present', 'late', 'absent']),
});

const submitSchema = z.object({
  sessionId: z.string().min(1),
});

const createClassSchema = z.object({
  name: z.string().min(1),
  teacherId: z.string().min(1),
});

const assignStudentSchema = z.object({
  studentId: z.string().min(1),
});

module.exports = {
  loginSchema,
  createUserSchema,
  startSessionSchema,
  markAttendanceSchema,
  manualMarkSchema,
  submitSchema,
  createClassSchema,
  assignStudentSchema,
};
