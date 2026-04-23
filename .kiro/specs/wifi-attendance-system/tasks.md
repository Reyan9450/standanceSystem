# Implementation Plan: WiFi Attendance System

## Overview

This plan implements a web-based attendance system with IP-based verification. The backend is Node.js + Express + MongoDB with clean architecture (Routes → Middleware → Controllers → Services → Models). The frontend is React + Vite + Tailwind CSS. The implementation follows an incremental approach: backend core → authentication → session management → attendance logic → admin features → frontend → integration.

---

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create `backend/` and `frontend/` directories
  - Initialize backend: `npm init`, install Express, Mongoose, bcrypt, jsonwebtoken, zod, dotenv, cors
  - Initialize frontend: `npm create vite@latest`, install Tailwind CSS, React Router, axios
  - Install testing dependencies: Jest, mongodb-memory-server, fast-check (backend), Vitest, React Testing Library (frontend)
  - Create folder structure: `backend/src/{routes,controllers,services,models,middleware,utils}`, `frontend/src/{pages,components,services}`
  - _Requirements: 15.1_

- [ ] 2. Implement core utilities and error handling
  - [x] 2.1 Create error classes (AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, InternalError)
    - Define error class hierarchy with status codes
    - _Requirements: 13.2_
  
  - [x] 2.2 Create centralized error handler middleware
    - Catch all errors and return consistent JSON response shape
    - _Requirements: 13.2_
  
  - [x] 2.3 Implement IP_Verifier utility with `sameSubnet(ip1, ip2)` function
    - Extract first three octets from IPv4 addresses
    - Return false for malformed IPs without throwing
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ]* 2.4 Write property test for IP_Verifier
    - **Property 1: IP Subnet Match Symmetry**
    - **Property 2: IP Subnet Match Correctness**
    - **Property 3: Malformed IP Handling**
    - **Validates: Requirements 12.2, 12.3, 12.4**
  
  - [x] 2.5 Create JWT utility with `sign(payload)` and `verify(token)` functions
    - Use jsonwebtoken library with secret from environment variable
    - _Requirements: 1.1, 15.1_

- [ ] 3. Implement database models
  - [x] 3.1 Create User model with Mongoose schema
    - Fields: name, email (unique, lowercase), password (hashed), role (enum), classId (optional ref)
    - Add index on email
    - _Requirements: 1.3, 2.1, 2.2_
  
  - [x] 3.2 Create Class model with Mongoose schema
    - Fields: name, teacherId (ref to User)
    - _Requirements: 3.1_
  
  - [x] 3.3 Create Session model with Mongoose schema
    - Fields: classId (ref), teacherId (ref), subject, startTime, endTime, status (enum: active/closed), teacherIP
    - Add compound index on { classId: 1, status: 1 }
    - _Requirements: 4.1, 4.2, 4.5_
  
  - [x] 3.4 Create Attendance model with Mongoose schema
    - Fields: studentId (ref), sessionId (ref), status (enum: present/late/absent), verification (enum: verified/unverified/teacher-approved), source (enum: wifi/manual/qr/system), time
    - Add unique compound index on { studentId: 1, sessionId: 1 }
    - _Requirements: 5.8, 14.1_

- [ ] 4. Implement authentication service and endpoints
  - [x] 4.1 Create AuthService with `login(email, password)` method
    - Find user by email, compare password with bcrypt, return JWT token
    - Throw UnauthorizedError on invalid credentials
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 4.2 Create authentication middleware `authenticate(req, res, next)`
    - Extract JWT from Authorization header, verify, attach user to req.user
    - Throw UnauthorizedError if token missing or invalid
    - _Requirements: 1.4_
  
  - [x] 4.3 Create role-based middleware `requireRole(...roles)`
    - Check req.user.role against allowed roles
    - Throw ForbiddenError if role doesn't match
    - _Requirements: 1.5_
  
  - [ ]* 4.4 Write property test for role-based access enforcement
    - **Property 10: Role-Based Access Enforcement**
    - **Validates: Requirements 1.5, 2.4, 3.4, 4.4, 6.3, 7.4, 8.4, 9.5, 10.3, 11.2**
  
  - [x] 4.5 Create validation middleware using Zod schemas
    - Define schemas for login, user creation, session start, attendance mark, etc.
    - Middleware validates req.body and throws ValidationError on failure
    - _Requirements: 1.6, 13.1, 13.2_
  
  - [ ]* 4.6 Write property test for input validation
    - **Property 13: Input Validation Rejects Invalid Payloads**
    - **Validates: Requirements 13.1, 13.2**
  
  - [x] 4.7 Create AuthController with `login` method
    - Call AuthService.login, return token and user (without password)
    - _Requirements: 1.1_
  
  - [x] 4.8 Create auth routes: POST /api/auth/login
    - Wire validation → controller
    - _Requirements: 1.1_
  
  - [ ]* 4.9 Write property test for password never exposed
    - **Property 8: Password Never Exposed in Responses**
    - **Validates: Requirements 2.5, 15.3**

- [x] 5. Checkpoint - Ensure authentication works
  - Test login endpoint manually or with unit tests
  - Verify JWT is returned and can be verified
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement session management
  - [x] 6.1 Create SessionService with `startSession(teacherId, classId, subject, teacherIP)` method
    - Check no active session exists for classId (throw ConflictError if exists)
    - Verify teacher is assigned to class (throw ForbiddenError if not)
    - Create session with status "active", capture teacherIP and startTime
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [ ]* 6.2 Write property test for session creation
    - **Property 12: Session Creation Captures Correct Fields**
    - **Validates: Requirements 4.1, 4.5**
  
  - [x] 6.3 Add `getActiveSession(classId)` method to SessionService
    - Find session with classId and status "active"
    - Return null if not found
    - _Requirements: 5.6_
  
  - [x] 6.4 Add `endSession(sessionId, teacherId)` method to SessionService
    - Verify teacher owns the session (throw ForbiddenError if not)
    - Mark all students in class without attendance records as "absent" with source "system"
    - Update session status to "closed" and set endTime
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [ ]* 6.5 Write property test for finalize marks all absent
    - **Property 6: Finalize Marks All Unmarked Students Absent**
    - **Validates: Requirements 9.1**
  
  - [x] 6.6 Create SessionController with `start`, `getActive`, `end` methods
    - Extract teacherIP from req.ip or req.headers['x-forwarded-for']
    - Call SessionService methods
    - _Requirements: 4.1, 9.1_
  
  - [x] 6.7 Create session routes: POST /api/session/start, GET /api/session/active, POST /api/session/end
    - Apply authenticate + requireRole("teacher") middleware
    - Wire validation → controller
    - _Requirements: 4.1, 9.1_

- [ ] 7. Implement attendance marking logic
  - [x] 7.1 Create AttendanceService with `markAttendance(studentId, sessionId, studentIP)` method
    - Get active session (throw NotFoundError if not found)
    - Check for duplicate (throw ConflictError if exists)
    - Use IP_Verifier.sameSubnet to determine verification ("verified" or "unverified")
    - Calculate time difference from session.startTime to determine status ("present" if ≤ 5 min, "late" if > 5 min)
    - Create Attendance record with source "wifi"
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_
  
  - [ ]* 7.2 Write property test for verification status from IP comparison
    - **Property 11: Verification Status Derived from IP Comparison**
    - **Validates: Requirements 5.2, 5.3**
  
  - [ ]* 7.3 Write property test for time window status assignment
    - **Property 5: Time Window Status Assignment**
    - **Validates: Requirements 5.4, 5.5**
  
  - [ ]* 7.4 Write property test for duplicate attendance rejection
    - **Property 4: Duplicate Attendance Rejection**
    - **Validates: Requirements 5.7, 14.1, 14.2**
  
  - [x] 7.5 Add `getSessionAttendance(sessionId)` method to AttendanceService
    - Fetch all attendance records for session
    - Group by verification status: verified, unverified
    - Fetch all students in class and identify those not in attendance records (absent)
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 7.6 Write property test for attendance dashboard grouping
    - **Property 15: Attendance Dashboard Grouping Correctness**
    - **Validates: Requirements 6.1, 6.2**
  
  - [x] 7.7 Add `approveRecord(recordId, teacherId)` method to AttendanceService
    - Verify session is active (throw error if closed)
    - Update verification to "verified" and source to "teacher-approved"
    - _Requirements: 7.1, 7.3_
  
  - [x] 7.8 Add `rejectRecord(recordId, teacherId)` method to AttendanceService
    - Verify session is active (throw error if closed)
    - Update status to "absent"
    - _Requirements: 7.2, 7.3_
  
  - [x] 7.9 Add `manualMark(teacherId, studentId, sessionId, status)` method to AttendanceService
    - Verify session exists (throw NotFoundError if not)
    - Upsert attendance record with source "manual" and verification "teacher-approved"
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ]* 7.10 Write property test for manual mark upsert consistency
    - **Property 9: Manual Mark Upsert Consistency**
    - **Validates: Requirements 8.1, 8.2**
  
  - [x] 7.11 Add `submitAttendance(sessionId, teacherId)` method to AttendanceService
    - Call SessionService.endSession
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 7.12 Write property test for closed session rejects marking
    - **Property 7: Closed Session Rejects Further Marking**
    - **Validates: Requirements 9.4**
  
  - [x] 7.13 Add `getStudentHistory(studentId)` method to AttendanceService
    - Fetch all attendance records for studentId
    - Populate session details (class, subject, date)
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 7.14 Write property test for student history isolation
    - **Property 14: Student History Isolation**
    - **Validates: Requirements 10.3**
  
  - [x] 7.15 Create AttendanceController with `mark`, `getBySession`, `approve`, `reject`, `manual`, `submit`, `getHistory` methods
    - Extract studentIP from req.ip or req.headers['x-forwarded-for']
    - Call AttendanceService methods
    - _Requirements: 5.1, 6.1, 7.1, 7.2, 8.1, 9.1, 10.1_
  
  - [x] 7.16 Create attendance routes: POST /api/attendance/mark, GET /api/attendance/session/:id, PATCH /api/attendance/:id/approve, PATCH /api/attendance/:id/reject, POST /api/attendance/manual, POST /api/attendance/submit, GET /api/attendance/history
    - Apply authenticate + role middleware as appropriate
    - Wire validation → controller
    - _Requirements: 5.1, 6.1, 7.1, 7.2, 8.1, 9.1, 10.1_

- [x] 8. Checkpoint - Ensure session and attendance logic works
  - Test session start, student mark, teacher approve/reject, finalize
  - Verify IP verification and time window logic
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement admin features
  - [x] 9.1 Create AdminService with `createUser(name, email, password, role, classId)` method
    - Hash password with bcrypt
    - Check for duplicate email (throw ConflictError if exists)
    - Create user
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 9.2 Add `listUsers()` method to AdminService
    - Fetch all users, exclude password field
    - _Requirements: 2.5_
  
  - [x] 9.3 Add `createClass(name, teacherId)` method to AdminService
    - Create class
    - _Requirements: 3.1_
  
  - [x] 9.4 Add `assignStudentToClass(classId, studentId)` method to AdminService
    - Verify student and class exist (throw NotFoundError if not)
    - Update student's classId
    - _Requirements: 3.2, 3.3_
  
  - [x] 9.5 Add `getReports()` method to AdminService
    - Aggregate attendance data: total sessions, present/late/absent counts per student per class
    - _Requirements: 11.1_
  
  - [x] 9.6 Create AdminController with `createUser`, `listUsers`, `createClass`, `assignStudent`, `getReports` methods
    - Call AdminService methods
    - _Requirements: 2.1, 2.5, 3.1, 3.2, 11.1_
  
  - [x] 9.7 Create admin routes: POST /api/admin/users, GET /api/admin/users, POST /api/admin/classes, POST /api/admin/classes/:id/assign, GET /api/admin/reports
    - Apply authenticate + requireRole("admin") middleware
    - Wire validation → controller
    - _Requirements: 2.1, 2.5, 3.1, 3.2, 11.1_

- [ ] 10. Wire backend together and add environment configuration
  - [x] 10.1 Create main Express app in `backend/src/index.js`
    - Load environment variables with dotenv
    - Connect to MongoDB using Mongoose
    - Apply CORS middleware
    - Apply JSON body parser
    - Mount routes: /api/auth, /api/session, /api/attendance, /api/admin
    - Apply centralized error handler middleware
    - Start server on port from environment variable
    - _Requirements: 15.1, 15.2_
  
  - [x] 10.2 Create `.env.example` file with required variables
    - JWT_SECRET, MONGO_URI, PORT
    - _Requirements: 15.1_
  
  - [x] 10.3 Add startup validation for required environment variables
    - Exit with error if JWT_SECRET or MONGO_URI is missing
    - _Requirements: 15.2_

- [x] 11. Checkpoint - Ensure backend is fully functional
  - Test all endpoints with Postman or similar tool
  - Verify all property tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement frontend authentication and routing
  - [x] 12.1 Create API service layer in `frontend/src/services/api.js`
    - Configure axios with base URL and interceptors for JWT token
    - Create methods for all backend endpoints
    - _Requirements: 1.1_
  
  - [x] 12.2 Create Login page component
    - Form with email and password fields
    - Call API login endpoint, store JWT in localStorage
    - Redirect to role-appropriate dashboard on success
    - _Requirements: 1.1_
  
  - [x] 12.3 Create ProtectedRoute component
    - Check for JWT in localStorage
    - Redirect to login if not authenticated
    - _Requirements: 1.4_
  
  - [x] 12.4 Set up React Router with routes
    - / → Login
    - /teacher → TeacherDashboard (protected, role: teacher)
    - /student → StudentDashboard (protected, role: student)
    - /admin → AdminDashboard (protected, role: admin)
    - _Requirements: 1.1_

- [ ] 13. Implement teacher dashboard
  - [x] 13.1 Create TeacherDashboard page component
    - Display "Start Session" form (select class, enter subject)
    - Display active session info if session is active
    - Display live attendance table with three sections: verified, unverified, not marked
    - Add approve/reject buttons for unverified students
    - Add manual mark dropdown for not-marked students
    - Add "Submit Attendance" button to finalize
    - _Requirements: 4.1, 6.1, 7.1, 7.2, 8.1, 9.1_
  
  - [x] 13.2 Implement session start logic
    - Call POST /api/session/start
    - Refresh dashboard to show active session
    - _Requirements: 4.1_
  
  - [x] 13.3 Implement live attendance polling
    - Poll GET /api/attendance/session/:id every 5 seconds while session is active
    - Update attendance table with latest data
    - _Requirements: 6.1_
  
  - [x] 13.4 Implement approve/reject actions
    - Call PATCH /api/attendance/:id/approve or /api/attendance/:id/reject
    - Refresh attendance data
    - _Requirements: 7.1, 7.2_
  
  - [x] 13.5 Implement manual mark action
    - Call POST /api/attendance/manual
    - Refresh attendance data
    - _Requirements: 8.1_
  
  - [x] 13.6 Implement submit attendance action
    - Call POST /api/attendance/submit
    - Close session and lock attendance
    - _Requirements: 9.1_

- [ ] 14. Implement student dashboard
  - [x] 14.1 Create StudentDashboard page component
    - Display "Mark Attendance" button if active session exists
    - Display attendance history table
    - Display current status (present/late/absent) for active session
    - _Requirements: 5.1, 10.1_
  
  - [x] 14.2 Implement mark attendance action
    - Call POST /api/attendance/mark
    - Display success or error message
    - _Requirements: 5.1_
  
  - [x] 14.3 Implement attendance history display
    - Call GET /api/attendance/history
    - Display table with session date, class, subject, status
    - _Requirements: 10.1, 10.2_

- [ ] 15. Implement admin dashboard
  - [x] 15.1 Create AdminDashboard page component
    - Display "Create User" form (name, email, password, role, classId)
    - Display "Create Class" form (name, teacherId)
    - Display "Assign Student to Class" form (studentId, classId)
    - Display user list table
    - Display reports section with aggregated attendance data
    - _Requirements: 2.1, 3.1, 3.2, 11.1_
  
  - [x] 15.2 Implement create user action
    - Call POST /api/admin/users
    - Refresh user list
    - _Requirements: 2.1_
  
  - [x] 15.3 Implement create class action
    - Call POST /api/admin/classes
    - _Requirements: 3.1_
  
  - [x] 15.4 Implement assign student action
    - Call POST /api/admin/classes/:id/assign
    - _Requirements: 3.2_
  
  - [x] 15.5 Implement reports display
    - Call GET /api/admin/reports
    - Display aggregated data in tables or charts
    - _Requirements: 11.1_

- [ ] 16. Style frontend with Tailwind CSS
  - [x] 16.1 Apply Tailwind utility classes to all components
    - Use clean, minimal design
    - Ensure responsive layout for mobile and desktop
    - _Requirements: N/A (UI polish)_

- [ ] 17. Final integration and testing
  - [x] 17.1 Test complete user flows end-to-end
    - Admin creates users and classes
    - Teacher starts session
    - Students mark attendance
    - Teacher reviews and finalizes
    - Student views history
    - _Requirements: All_
  
  - [ ]* 17.2 Run all property-based tests and unit tests
    - Ensure all 15 properties pass with 100+ iterations
    - Fix any failing tests
    - _Requirements: All_
  
  - [x] 17.3 Verify error handling and edge cases
    - Test duplicate attendance, closed session marking, invalid JWT, wrong role access
    - _Requirements: All_

- [x] 18. Final checkpoint - Ensure system is production-ready
  - All tests pass
  - All features work end-to-end
  - Error handling is robust
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional property-based test tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across many generated inputs
- Unit tests validate specific examples and edge cases
- Both testing approaches are complementary and necessary for comprehensive coverage
