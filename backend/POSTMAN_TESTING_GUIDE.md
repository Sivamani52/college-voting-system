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

