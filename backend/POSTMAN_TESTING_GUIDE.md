# College Voting System - Complete Postman Testing Guide

This guide gives you exact step-by-step instructions to test all features of the backend in Postman.

---

## 📌 Base URL
```
http://localhost:5000
```

---

## 🚀 Pre-requisite Setup
Make sure your backend server is running:
```bash
cd backend
npm run dev
```

---

## 📋 Feature Testing Steps (In Order)

---

### Step 1: Health & Database Connectivity Check
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/test-db`
* **Headers**: *None*
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Database connected successfully",
  "result": [
    {
      "result": 1
    }
  ]
}
```

---

### Step 2: Super Admin Login (Get JWT Token)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/login`
* **Headers**:
  * `Content-Type: application/json`
* **Body (raw JSON)**:
```json
{
  "email": "superadmin@college.com",
  "password": "Admin@123"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "superadmin@college.com",
    "role": "SUPER_ADMIN"
  }
}
```
> 💡 **Copy the `token`** from this response. You will use it as `Bearer <SUPER_ADMIN_TOKEN>` in Step 3 and Step 8.

---

### Step 3: Create an Admin (Super Admin Only)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/admins`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <PASTE_SUPER_ADMIN_TOKEN_HERE>`
* **Body (raw JSON)**:
```json
{
  "name": "CSE Department Admin",
  "email": "cse.admin@college.com",
  "departmentId": 1,
  "yearId": 1,
  "sectionId": 1
}
```
* **Expected Response (`201 Created`)**:
```json
{
  "message": "Admin created successfully",
  "userId": 2,
  "adminId": 1,
  "temporaryPassword": "exampleTemporaryPassword123"
}
```
> 💡 **Take note of**:
> 1. `userId` (e.g. `2`)
> 2. `temporaryPassword` (e.g. `"exampleTemporaryPassword123"`)

---

### Step 4: Admin First Login (Requires Password Change)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/login`
* **Headers**:
  * `Content-Type: application/json`
* **Body (raw JSON)**:
```json
{
  "email": "cse.admin@college.com",
  "password": "<PASTE_TEMPORARY_PASSWORD_HERE>"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Password change required",
  "requiresPasswordChange": true,
  "userId": 2,
  "role": "ADMIN"
}
```

---

### Step 5: Change Temporary Password
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/change-password`
* **Headers**:
  * `Content-Type: application/json`
* **Body (raw JSON)**:
```json
{
  "userId": 2,
  "currentPassword": "<PASTE_TEMPORARY_PASSWORD_HERE>",
  "newPassword": "NewAdminPassword@123"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Password changed successfully"
}
```

---

### Step 6: Admin Login with Permanent Password
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/login`
* **Headers**:
  * `Content-Type: application/json`
* **Body (raw JSON)**:
```json
{
  "email": "cse.admin@college.com",
  "password": "NewAdminPassword@123"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "cse.admin@college.com",
    "role": "ADMIN"
  }
}
```
> 💡 **Copy the `token`** from this response. You will use it as `Bearer <ADMIN_TOKEN>`.

---

### Step 7: Forgot Password Flow (OTP Verification)

#### 7a. Request OTP
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/forgot-password`
* **Headers**: `Content-Type: application/json`
* **Body (raw JSON)**:
```json
{
  "email": "cse.admin@college.com"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "OTP sent to your registered email",
  "requiresOTP": true
}
```

#### 7b. Verify OTP
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/verify-forgot-password-otp`
* **Headers**: `Content-Type: application/json`
* **Body (raw JSON)**:
```json
{
  "email": "cse.admin@college.com",
  "otp": "<6_DIGIT_OTP_RECEIVED_IN_EMAIL>"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "OTP verified successfully",
  "resetAllowed": true,
  "userId": 2
}
```

#### 7c. Reset Password
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/reset-password`
* **Headers**: `Content-Type: application/json`
* **Body (raw JSON)**:
```json
{
  "userId": 2,
  "newPassword": "BrandNewAdminPassword@123"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Password reset successfully"
}
```

---

### Step 8: Role-Based Route Protection Tests

#### 8a. Super Admin Protected Route
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/test/super-admin`
* **Headers**: `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Welcome Super Admin",
  "user": {
    "userId": 1,
    "email": "superadmin@college.com",
    "role": "SUPER_ADMIN"
  }
}
```
*(If you send an Admin token here, you will receive `403 Forbidden`)*.

#### 8b. Admin Protected Route
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/test/admin`
* **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Admin access granted",
  "user": {
    "userId": 2,
    "email": "cse.admin@college.com",
    "role": "ADMIN"
  }
}
```

#### 8c. Student Protected Route
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/test/student`
* **Headers**: `Authorization: Bearer <STUDENT_TOKEN>`
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Student access granted",
  "user": {
    "userId": 3,
    "email": "student@college.com",
    "role": "STUDENT"
  }
}
```

---

### Step 9: Create a Student (Admin or Super Admin)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/students`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <ADMIN_OR_SUPER_ADMIN_TOKEN>`
* **Body (raw JSON)**:
```json
{
  "studentId": "21CS001",
  "fullName": "John Doe",
  "email": "john.doe@college.com",
  "departmentId": 1,
  "yearId": 1,
  "sectionId": 1,
  "phone": "9876543210"
}
```
* **Expected Response (`201 Created`)**:
```json
{
  "message": "Student created successfully",
  "userId": 3,
  "studentRecordId": 1,
  "studentId": "21CS001",
  "temporaryPassword": "exampleTemporaryPassword123"
}
```
> 💡 The temporary password will also be automatically appended to `backend/credentials.txt`!

---

### Step 10: Student First Login & Password Setup

#### 10a. First Login with Temporary Password
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/login`
* **Body (raw JSON)**:
```json
{
  "email": "john.doe@college.com",
  "password": "<PASTE_STUDENT_TEMPORARY_PASSWORD_HERE>"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Password change required",
  "requiresPasswordChange": true,
  "userId": 3,
  "role": "STUDENT"
}
```

#### 10b. Change Temporary Password
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/change-password`
* **Body (raw JSON)**:
```json
{
  "userId": 3,
  "currentPassword": "<PASTE_STUDENT_TEMPORARY_PASSWORD_HERE>",
  "newPassword": "StudentPassword@123"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Password changed successfully"
}
```

#### 10c. Login with New Password
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/auth/login`
* **Body (raw JSON)**:
```json
{
  "email": "john.doe@college.com",
  "password": "StudentPassword@123"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "email": "john.doe@college.com",
    "role": "STUDENT"
  }
}
```

---

### Step 11: Election Management (Super Admin)

#### 11a. Create an Election
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/elections`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Body (raw JSON)**:
```json
{
  "title": "College Student Council Election 2026",
  "description": "Annual elections for student council representatives",
  "startDate": "2026-09-01T09:00:00.000Z",
  "endDate": "2026-09-05T17:00:00.000Z"
}
```
* **Expected Response (`201 Created`)**:
```json
{
  "message": "Election created successfully",
  "electionId": 1
}
```

#### 11b. Get All Elections
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/elections`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Expected Response (`200 OK`)**:
```json
{
  "elections": [
    {
      "id": 1,
      "title": "College Student Council Election 2026",
      "description": "Annual elections for student council representatives",
      "start_date": "2026-09-01T09:00:00.000Z",
      "end_date": "2026-09-05T17:00:00.000Z",
      "status": "DRAFT",
      "created_by": 1,
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

#### 11c. Get Election by ID
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/elections/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`

#### 11d. Update Election Status
* **Method**: `PATCH`
* **URL**: `http://localhost:5000/api/elections/1/status`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Body (raw JSON)**:
```json
{
  "status": "UPCOMING"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Election status updated successfully"
}
```

---

### Step 12: Position Management (Super Admin)

#### 12a. Create a Position
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/positions`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Body (raw JSON)**:
```json
{
  "electionId": 1,
  "name": "President",
  "description": "Student Council President"
}
```
* **Expected Response (`201 Created`)**:
```json
{
  "message": "Position created successfully",
  "positionId": 1
}
```

#### 12b. Get Positions by Election
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/positions/election/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` / `STUDENT` token)
* **Expected Response (`200 OK`)**:
```json
{
  "positions": [
    {
      "id": 1,
      "election_id": 1,
      "name": "President",
      "description": "Student Council President",
      "created_at": "..."
    }
  ]
}
```

#### 12c. Get Position by ID
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/positions/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` / `STUDENT` token)
* **Expected Response (`200 OK`)**:
```json
{
  "position": {
    "id": 1,
    "election_id": 1,
    "name": "President",
    "description": "Student Council President",
    "created_at": "..."
  }
}
```

#### 12d. Update a Position
* **Method**: `PUT`
* **URL**: `http://localhost:5000/api/positions/1`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Body (raw JSON)**:
```json
{
  "name": "Student Council President",
  "description": "Overall lead representative for student affairs"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Position updated successfully"
}
```

#### 12e. Delete a Position
* **Method**: `DELETE`
* **URL**: `http://localhost:5000/api/positions/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Position deleted successfully"
}
```

---

### Step 13: Candidate Management

#### 13a. Create a Candidate (Super Admin)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/candidates`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Body (raw JSON)**:
```json
{
  "electionId": 1,
  "positionId": 1,
  "studentId": "21CS001",
  "manifesto": "Committed to improving campus facilities and student voice",
  "photoUrl": "https://example.com/photos/john_doe.jpg"
}
```
*(Note: `studentId` can be either the student roll number `"21CS001"` or the internal student ID `1`)*
* **Expected Response (`201 Created`)**:
```json
{
  "message": "Candidate created successfully",
  "candidateId": 1
}
```

#### 13b. Get Candidates by Election
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/candidates/election/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` / `STUDENT` token)
* **Expected Response (`200 OK`)**:
```json
{
  "candidates": [
    {
      "id": 1,
      "election_id": 1,
      "position_id": 1,
      "student_id": 1,
      "manifesto": "Committed to improving campus facilities and student voice",
      "photo_url": "https://example.com/photos/john_doe.jpg",
      "status": "ACTIVE",
      "full_name": "John Doe",
      "student_code": "21CS001",
      "department_id": 1,
      "year_id": 1,
      "section_id": 1,
      "position_name": "President"
    }
  ]
}
```

#### 13c. Get Candidates by Position
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/candidates/position/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` / `STUDENT` token)
* **Expected Response (`200 OK`)**:
```json
{
  "candidates": [
    {
      "id": 1,
      "election_id": 1,
      "position_id": 1,
      "student_id": 1,
      "manifesto": "Committed to improving campus facilities and student voice",
      "photo_url": "https://example.com/photos/john_doe.jpg",
      "status": "ACTIVE",
      "full_name": "John Doe",
      "student_code": "21CS001",
      "department_id": 1,
      "year_id": 1,
      "section_id": 1,
      "position_name": "President"
    }
  ]
}
```

#### 13d. Get Candidate by ID
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/candidates/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` / `STUDENT` token)
* **Expected Response (`200 OK`)**:
```json
{
  "candidate": {
    "id": 1,
    "election_id": 1,
    "position_id": 1,
    "student_id": 1,
    "manifesto": "Committed to improving campus facilities and student voice",
    "photo_url": "https://example.com/photos/john_doe.jpg",
    "status": "ACTIVE",
    "full_name": "John Doe",
    "student_code": "21CS001",
    "department_id": 1,
    "year_id": 1,
    "section_id": 1,
    "position_name": "President"
  }
}
```

#### 13e. Update Candidate (Super Admin)
* **Method**: `PUT`
* **URL**: `http://localhost:5000/api/candidates/1`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Body (raw JSON)**:
```json
{
  "manifesto": "Updated manifesto: Empowering all students through innovation and transparency",
  "status": "ACTIVE"
}
```
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Candidate updated successfully"
}
```

#### 13f. Delete Candidate (Super Admin)
* **Method**: `DELETE`
* **URL**: `http://localhost:5000/api/candidates/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>`
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Candidate deleted successfully"
}
```

---

### Step 14: Eligible Voter Management

#### 14a. Add a Single Eligible Voter (Super Admin / Admin)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/eligible-voters`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` token)
* **Body (raw JSON)**:
```json
{
  "electionId": 1,
  "studentId": "21CS001"
}
```
*(Note: `studentId` can be either the student roll number `"21CS001"` or the internal student ID `1`)*
* **Expected Response (`201 Created`)**:
```json
{
  "message": "Student added as eligible voter",
  "eligibleVoterId": 1
}
```

#### 14b. Bulk Add Eligible Voters by Department / Year / Section (Super Admin / Admin)
* **Method**: `POST`
* **URL**: `http://localhost:5000/api/eligible-voters/bulk`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` token)
* **Body (raw JSON)**:
```json
{
  "electionId": 1,
  "departmentId": 1,
  "yearId": 1,
  "sectionId": 1
}
```
*(Or specify an explicit array of student IDs: `{"electionId": 1, "studentIds": ["21CS001", "21CS002"]}`)*
* **Expected Response (`201 Created`)**:
```json
{
  "message": "1 eligible voters added successfully",
  "totalAdded": 1
}
```

#### 14c. Check Student Eligibility (Student / Admin / Super Admin)
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/eligible-voters/check/1`
* **Headers**:
  * `Authorization: Bearer <STUDENT_TOKEN>`
* **Expected Response (`200 OK`)**:
```json
{
  "electionId": 1,
  "isEligible": true,
  "studentId": 1,
  "studentCode": "21CS001"
}
```

#### 14d. Get All Eligible Voters for an Election (Super Admin / Admin)
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/eligible-voters/election/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` token)
* **Expected Response (`200 OK`)**:
```json
{
  "eligibleVoters": [
    {
      "id": 1,
      "election_id": 1,
      "student_id": 1,
      "created_at": "...",
      "full_name": "John Doe",
      "student_code": "21CS001",
      "department_id": 1,
      "year_id": 1,
      "section_id": 1
    }
  ]
}
```

#### 14e. Get Eligible Voter by ID (Super Admin / Admin)
* **Method**: `GET`
* **URL**: `http://localhost:5000/api/eligible-voters/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` token)
* **Expected Response (`200 OK`)**:
```json
{
  "eligibleVoter": {
    "id": 1,
    "election_id": 1,
    "student_id": 1,
    "created_at": "...",
    "full_name": "John Doe",
    "student_code": "21CS001"
  }
}
```

#### 14f. Remove Eligible Voter by ID (Super Admin / Admin)
* **Method**: `DELETE`
* **URL**: `http://localhost:5000/api/eligible-voters/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` token)
* **Expected Response (`200 OK`)**:
```json
{
  "message": "Eligible voter removed successfully"
}
```

#### 14g. Remove All Eligible Voters for an Election (Super Admin / Admin)
* **Method**: `DELETE`
* **URL**: `http://localhost:5000/api/eligible-voters/election/1`
* **Headers**:
  * `Authorization: Bearer <SUPER_ADMIN_TOKEN>` (or `ADMIN` token)
* **Expected Response (`200 OK`)**:
```json
{
  "message": "1 eligible voters removed successfully",
  "totalRemoved": 1
}
```





