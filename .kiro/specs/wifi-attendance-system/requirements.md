# Requirements Document

## Introduction

A web-based Smart WiFi Attendance System that allows teachers to start attendance sessions, students to mark their attendance via IP-based WiFi verification, and admins to manage users and classes. The system uses subnet matching to verify that students are on the same network as the teacher, with a time window for late marking. Teachers can review, approve, reject, and manually override attendance before finalizing. The MVP targets a clean, role-based, modular web application built with React, Node.js/Express, and MongoDB.

## Glossary

- **System**: The Smart WiFi-Based Attendance System web application
- **Admin**: A privileged user who manages users, classes, and views reports
- **Teacher**: A user who starts sessions, reviews attendance, and submits final records
- **Student**: A user who marks their own attendance during an active session
- **Session**: A time-bounded attendance event created by a teacher for a specific class
- **Attendance_Record**: A record linking a student to a session with status, verification, and source fields
- **IP_Verifier**: The backend component that compares student and teacher IP addresses for subnet matching
- **Auth_Service**: The backend component responsible for authentication and JWT token management
- **Session_Service**: The backend component responsible for creating, managing, and closing sessions
- **Attendance_Service**: The backend component responsible for recording and updating attendance
- **Admin_Service**: The backend component responsible for user and class management
- **JWT**: JSON Web Token used for stateless authentication
- **Subnet**: The first three octets of an IPv4 address used to determine network proximity (e.g., 192.168.1.x)
- **Verification_Status**: Either "verified" (IP matched) or "unverified" (IP did not match)
- **Attendance_Status**: One of "present", "late", or "absent"
- **Attendance_Source**: One of "wifi", "manual", or "qr"
- **Time_Window**: The 5-minute period after session start during which attendance is marked as "present" rather than "late"

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user (admin, teacher, or student), I want to log in with my credentials, so that I can access role-appropriate features securely.

#### Acceptance Criteria

1. WHEN a user submits valid credentials (email and password), THE Auth_Service SHALL return a signed JWT token containing the user's ID and role.
2. WHEN a user submits invalid credentials, THE Auth_Service SHALL return an error response with HTTP status 401.
3. THE Auth_Service SHALL hash all passwords using bcrypt before storing them in the database.
4. WHEN a request is made to a protected endpoint without a valid JWT, THE System SHALL return an error response with HTTP status 401.
5. WHEN a request is made to a role-restricted endpoint by a user whose role does not match, THE System SHALL return an error response with HTTP status 403.
6. THE Auth_Service SHALL validate all login input fields using a schema validator before processing.

---

### Requirement 2: Admin — User Management

**User Story:** As an admin, I want to create and manage user accounts, so that teachers and students can access the system with appropriate roles.

#### Acceptance Criteria

1. WHEN an admin submits a valid new user payload (name, email, password, role), THE Admin_Service SHALL create the user and return the created user object with HTTP status 201.
2. WHEN an admin submits a new user payload with a duplicate email, THE Admin_Service SHALL return an error response with HTTP status 409.
3. WHEN an admin submits a new user payload with missing required fields, THE Admin_Service SHALL return a validation error with HTTP status 400.
4. THE Admin_Service SHALL only allow users with the "admin" role to create, update, or delete user accounts.
5. WHEN an admin requests the list of all users, THE Admin_Service SHALL return all user records excluding password fields.

---

### Requirement 3: Admin — Class Management

**User Story:** As an admin, I want to create classes and assign students to them, so that teachers can run sessions for specific groups.

#### Acceptance Criteria

1. WHEN an admin submits a valid class creation payload (name, assigned teacher), THE Admin_Service SHALL create the class and return the created class object with HTTP status 201.
2. WHEN an admin assigns a student to a class, THE Admin_Service SHALL update the student's classId field and return HTTP status 200.
3. WHEN an admin assigns a non-existent student or class ID, THE Admin_Service SHALL return an error response with HTTP status 404.
4. THE Admin_Service SHALL only allow users with the "admin" role to create classes or assign students.

---

### Requirement 4: Teacher — Start Attendance Session

**User Story:** As a teacher, I want to start an attendance session for my class, so that students can begin marking their attendance.

#### Acceptance Criteria

1. WHEN a teacher submits a valid session start request (classId, subject), THE Session_Service SHALL create a new session record with status "active", capture the teacher's IP address, record the startTime, and return the session object with HTTP status 201.
2. WHEN a teacher attempts to start a session while an active session already exists for that class, THE Session_Service SHALL return an error response with HTTP status 409.
3. WHEN a teacher attempts to start a session for a class they are not assigned to, THE Session_Service SHALL return an error response with HTTP status 403.
4. THE Session_Service SHALL only allow users with the "teacher" role to start sessions.
5. WHEN a session is created, THE Session_Service SHALL store the teacherIP derived from the incoming request.

---

### Requirement 5: Student — Mark Attendance

**User Story:** As a student, I want to mark my attendance during an active session, so that my presence is recorded.

#### Acceptance Criteria

1. WHEN a student submits a mark-attendance request during an active session, THE Attendance_Service SHALL extract the student's IP address from the request.
2. WHEN the student's IP subnet matches the teacher's IP subnet, THE Attendance_Service SHALL set verification to "verified".
3. WHEN the student's IP subnet does not match the teacher's IP subnet, THE Attendance_Service SHALL set verification to "unverified".
4. WHEN the mark-attendance request is received within the Time_Window (5 minutes of session start), THE Attendance_Service SHALL set status to "present".
5. WHEN the mark-attendance request is received after the Time_Window has elapsed, THE Attendance_Service SHALL set status to "late".
6. WHEN a student attempts to mark attendance with no active session for their class, THE Attendance_Service SHALL return an error response with HTTP status 404.
7. WHEN a student attempts to mark attendance more than once in the same session, THE Attendance_Service SHALL return an error response with HTTP status 409.
8. THE Attendance_Service SHALL store the Attendance_Record with source set to "wifi", the resolved status, verification, studentId, sessionId, and timestamp.

---

### Requirement 6: Teacher — View Live Attendance Dashboard

**User Story:** As a teacher, I want to view live attendance during an active session, so that I can monitor who has marked attendance and their verification status.

#### Acceptance Criteria

1. WHEN a teacher requests attendance data for an active session, THE Attendance_Service SHALL return all Attendance_Records for that session grouped by verification status.
2. WHEN a teacher requests attendance data for a session, THE Attendance_Service SHALL also return the list of students in the class who have not yet marked attendance.
3. THE Attendance_Service SHALL only allow users with the "teacher" role to view session attendance data.

---

### Requirement 7: Teacher — Approve or Reject Unverified Attendance

**User Story:** As a teacher, I want to approve or reject unverified attendance records, so that I can correct IP mismatches and ensure accurate records.

#### Acceptance Criteria

1. WHEN a teacher approves an unverified Attendance_Record, THE Attendance_Service SHALL update the verification field to "verified" and source to "teacher-approved".
2. WHEN a teacher rejects an unverified Attendance_Record, THE Attendance_Service SHALL update the status to "absent".
3. WHEN a teacher attempts to approve or reject a record in a closed session, THE Attendance_Service SHALL return an error response with HTTP status 400.
4. THE Attendance_Service SHALL only allow users with the "teacher" role to approve or reject attendance records.

---

### Requirement 8: Teacher — Manual Attendance Marking

**User Story:** As a teacher, I want to manually mark attendance for a student, so that I can handle cases where WiFi verification fails or a student is unable to use the web interface.

#### Acceptance Criteria

1. WHEN a teacher submits a manual attendance request for a student (studentId, sessionId, status), THE Attendance_Service SHALL create or update the Attendance_Record with source "manual" and verification "teacher-approved".
2. WHEN a teacher submits a manual attendance request for a student who already has a record in that session, THE Attendance_Service SHALL overwrite the existing record.
3. WHEN a teacher submits a manual attendance request for a non-existent student or session, THE Attendance_Service SHALL return an error response with HTTP status 404.
4. THE Attendance_Service SHALL only allow users with the "teacher" role to manually mark attendance.

---

### Requirement 9: Teacher — Submit and Finalize Attendance

**User Story:** As a teacher, I want to submit and finalize attendance for a session, so that all remaining unmarked students are recorded as absent and the session is locked.

#### Acceptance Criteria

1. WHEN a teacher submits a finalize request for an active session, THE Session_Service SHALL mark all students in the class who have no Attendance_Record for that session as "absent" with source "system" and verification "unverified".
2. WHEN a teacher submits a finalize request, THE Session_Service SHALL set the session status to "closed" and record the endTime.
3. WHEN a teacher attempts to finalize an already closed session, THE Session_Service SHALL return an error response with HTTP status 400.
4. WHEN a session is closed, THE Attendance_Service SHALL reject any further attendance marking attempts for that session with HTTP status 400.
5. THE Session_Service SHALL only allow the teacher who owns the session to finalize it.

---

### Requirement 10: Student — View Attendance History

**User Story:** As a student, I want to view my attendance history, so that I can track my presence across all sessions.

#### Acceptance Criteria

1. WHEN a student requests their attendance history, THE Attendance_Service SHALL return all Attendance_Records associated with that student's ID.
2. WHEN a student requests their attendance history, THE Attendance_Service SHALL include the session details (class, subject, date) alongside each record.
3. THE Attendance_Service SHALL only return attendance records belonging to the requesting student.

---

### Requirement 11: Admin — View Reports

**User Story:** As an admin, I want to view attendance reports, so that I can monitor overall attendance across classes and sessions.

#### Acceptance Criteria

1. WHEN an admin requests a report, THE Admin_Service SHALL return aggregated attendance data including total sessions, present count, late count, and absent count per student per class.
2. THE Admin_Service SHALL only allow users with the "admin" role to access reports.

---

### Requirement 12: IP-Based Subnet Verification

**User Story:** As the system, I want to verify student attendance using IP subnet matching, so that only students physically present on the same network as the teacher are automatically verified.

#### Acceptance Criteria

1. THE IP_Verifier SHALL extract the subnet from an IPv4 address by comparing the first three octets.
2. WHEN two IP addresses share the same first three octets, THE IP_Verifier SHALL return a match result of true.
3. WHEN two IP addresses do not share the same first three octets, THE IP_Verifier SHALL return a match result of false.
4. IF an IP address is malformed or not a valid IPv4 address, THEN THE IP_Verifier SHALL return a match result of false.

---

### Requirement 13: Input Validation

**User Story:** As the system, I want to validate all incoming API request payloads, so that invalid data does not reach the business logic layer.

#### Acceptance Criteria

1. THE System SHALL validate all API request bodies against defined schemas using Joi or Zod before passing them to controllers.
2. IF a request body fails schema validation, THEN THE System SHALL return an error response with HTTP status 400 and a descriptive message listing the invalid fields.
3. THE System SHALL sanitize all string inputs to prevent injection attacks.

---

### Requirement 14: Duplicate Attendance Prevention

**User Story:** As the system, I want to prevent duplicate attendance records, so that a student cannot mark attendance more than once per session.

#### Acceptance Criteria

1. THE Attendance_Service SHALL enforce a unique constraint on the combination of studentId and sessionId in the Attendance collection.
2. WHEN a duplicate attendance submission is detected, THE Attendance_Service SHALL return an error response with HTTP status 409.

---

### Requirement 15: Environment Configuration and Security

**User Story:** As a developer, I want all sensitive configuration to be managed via environment variables, so that secrets are not hardcoded in the codebase.

#### Acceptance Criteria

1. THE System SHALL load all sensitive configuration values (JWT secret, database URI, port) from environment variables at startup.
2. IF a required environment variable is missing at startup, THEN THE System SHALL log a descriptive error and exit with a non-zero status code.
3. THE System SHALL never expose password fields in any API response.
