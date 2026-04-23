const adminService = require('../services/adminService');
const asyncHandler = require('../utils/asyncHandler');

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, classId } = req.body;
  const user = await adminService.createUser(name, email, password, role, classId);
  res.status(201).json({ success: true, data: user });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers();
  res.json({ success: true, data: users });
});

const createClass = asyncHandler(async (req, res) => {
  const { name, teacherId } = req.body;
  const cls = await adminService.createClass(name, teacherId);
  res.status(201).json({ success: true, data: cls });
});

const assignStudent = asyncHandler(async (req, res) => {
  const student = await adminService.assignStudentToClass(req.params.id, req.body.studentId);
  res.json({ success: true, data: student });
});

const getReports = asyncHandler(async (req, res) => {
  const report = await adminService.getReports();
  res.json({ success: true, data: report });
});

module.exports = { createUser, listUsers, createClass, assignStudent, getReports };
