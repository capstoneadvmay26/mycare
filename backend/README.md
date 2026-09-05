# MyCare Backend

Backend API for **MyCare**, a healthcare support application that helps users manage medications, medication adherence, symptoms, and verification.

The backend is built with **Node.js, Express.js, MongoDB, and Mongoose**. It provides RESTful APIs for authentication, user verification, profiles, medications, medication logs, adherence tracking, and symptoms.

---

## Table of Contents

* [Technologies](#technologies)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [Running the Backend](#running-the-backend)
* [API Base URL](#api-base-url)
* [Authentication](#authentication)
* [User Registration and OTP Verification](#user-registration-and-otp-verification)
* [API Endpoints](#api-endpoints)
* [Medication Management](#medication-management)
* [Medication Logs](#medication-logs)
* [Medication History and Adherence](#medication-history-and-adherence)
* [Symptoms](#symptoms)
* [OTP Delivery](#otp-delivery)
* [Error Handling](#error-handling)
* [Testing with Postman](#testing-with-postman)
* [Deployment](#deployment)
* [Important Security Notes](#important-security-notes)
* [Development Workflow](#development-workflow)

---

# Technologies

The backend uses:

* **Node.js** – JavaScript runtime
* **Express.js** – Web framework
* **MongoDB Atlas** – Database
* **Mongoose** – MongoDB object modeling
* **JWT** – Authentication
* **bcryptjs** – Password hashing
* **Nodemailer / Resend** – Email OTP delivery
* **Twilio** – SMS OTP delivery
* **dotenv** – Environment variable management
* **Nodemon** – Development server
* **Render** – Backend deployment

---

# Project Structure

```text
backend/
│
├── index.js
├── package.json
├── package-lock.json
├── README.md
│
└── src/
    │
    ├── app.js
    │
    ├── config/
    │   └── connectDB.js
    │
    ├── controllers/
    │   ├── user.controller.js
    │   ├── profile.controller.js
    │   ├── medication.controller.js
    │   ├── medicationLog.controller.js
    │   └── symptom.controller.js
    │
    ├── middlewares/
    │   ├── errorHandler.js
    │   ├── logger.js
    │   └── requireAuth.js
    │
    ├── models/
    │   ├── user.model.js
    │   ├── profile.model.js
    │   ├── medication.model.js
    │   ├── medicationLog.model.js
    │   └── symptom.model.js
    │
    ├── routes/
    │   ├── user.route.js
    │   ├── profile.route.js
    │   ├── medication.route.js
    │   ├── medicationLog.route.js
    │   └── symptom.route.js
    │
    └── utils/
        ├── bcrypt.js
        ├── otpSender.js
        └── medicationLogGenerator.js
```

The exact files may change as the project develops.

---

# Getting Started

## Prerequisites

Before running the backend, install:

* Node.js
* npm
* MongoDB Atlas account or another MongoDB database
* Git

Check that Node.js and npm are installed:

```bash
node -v
npm -v
```

---

# Installing Dependencies

Navigate into the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RESEND_API_KEY=your_resend_api_key

EMAIL_FROM=your_verified_sender

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Important

Never commit `.env` to GitHub.

Your `.gitignore` should contain:

```text
.env
.env.*
node_modules/
```

Environment variables must be configured separately when deploying the backend to Render.

---

# Running the Backend

## Development

Run:

```bash
npm run dev
```

The backend should start on:

```text
http://localhost:5000
```

You should see something similar to:

```text
MongoDB Connected
Server running on port 5000
```

## Production

Run:

```bash
npm start
```

The production server uses:

```text
node index.js
```

---

# API Base URL

## Local

```text
http://localhost:5000/api/v1
```

## Render

```text
https://mycare-backend-23oc.onrender.com/api/v1
```

For example, the registration endpoint is:

```text
POST https://mycare-backend-23oc.onrender.com/api/v1/users/register
```

---

# Authentication

MyCare uses authentication to protect user-specific resources.

After successful login, the backend returns an authentication token.

Protected endpoints require the token in the request header:

```http
Authorization: Bearer YOUR_TOKEN
```

The authentication middleware verifies the token before allowing access to protected resources.

---

# User Registration and OTP Verification

The registration process uses OTP verification.

The general flow is:

```text
User enters registration details
          ↓
Backend validates details
          ↓
User is created / registration processed
          ↓
OTP is generated
          ↓
OTP is sent by email or SMS
          ↓
User enters OTP
          ↓
Backend verifies OTP
          ↓
Account becomes verified
          ↓
User can log in
```

---

## Register User

### Endpoint

```http
POST /users/register
```

### Full URL

```text
http://localhost:5000/api/v1/users/register
```

or:

```text
https://mycare-backend-23oc.onrender.com/api/v1/users/register
```

### Request Body

```json
{
  "name": "Chibundu",
  "email": "example@gmail.com",
  "password": "Password123"
}
```

### Successful Response

```json
{
  "success": true,
  "message": "Verification OTP sent to your email.",
  "requiresVerification": true,
  "userId": "USER_ID",
  "contactMethod": "email"
}
```

---

# OTP Verification

The user receives an OTP after registration.

The OTP is then submitted to the verification endpoint.

### Example

```http
POST /users/verify-otp
```

The request body will contain the user's identifier and OTP according to the current authentication implementation.

Example:

```json
{
  "userId": "USER_ID",
  "otp": "123456"
}
```

The backend checks whether:

* The OTP exists
* The OTP is correct
* The OTP has not expired
* The OTP belongs to the correct user

If valid, the user is verified.

---

# Login

### Endpoint

```http
POST /users/login
```

### Example

```json
{
  "email": "example@gmail.com",
  "password": "Password123"
}
```

A successful login returns an authentication token.

Example:

```json
{
  "success": true,
  "message": "Login successful.",
  "token": "JWT_TOKEN"
}
```

The token should be used for protected endpoints.

---

# API Endpoints

The API is organized into resources.

```text
/api/v1/users
/api/v1/profiles
/api/v1/medications
/api/v1/medication-logs
/api/v1/symptoms
```

---

# Profiles

Profiles allow a user to manage healthcare information for themselves or another person.

A profile belongs to a user.

The profile system supports information such as:

* Full name
* Date of birth
* Gender
* Relationship
* Status
* Whether the profile represents the user

### Example structure

```text
User
 │
 ├── Profile
 │
 ├── Profile
 │
 └── Profile
```

Each profile can have medications associated with it.

---

# Medications

Medications belong to a profile.

A medication contains information such as:

```text
Medication
├── profile
├── name
├── dosage
├── frequency
├── scheduleTimes
├── startDate
├── endDate
└── status
```

Supported frequencies include:

```text
once_daily
twice_daily
three_times_daily
weekly
as_needed
```

Example medication:

```json
{
  "profile": "PROFILE_ID",
  "name": "Medication A",
  "dosage": "500mg",
  "frequency": "twice_daily",
  "scheduleTimes": [
    "07:00",
    "19:00"
  ],
  "startDate": "2026-08-20"
}
```

---

# Medication Logs

Medication logs record individual scheduled medication doses.

A single medication log represents:

```text
ONE scheduled dose occurrence
```

For example, if a medication is scheduled twice a day:

```text
07:00 → MedicationLog
19:00 → MedicationLog
```

These are two separate medication log records.

---

## Medication Log Structure

```text
MedicationLog
├── profile
├── medication
├── scheduledFor
├── status
├── takenAt
├── skippedAt
└── skipReason
```

Possible statuses:

```text
pending
taken
skipped
```

---

# Mark Dose as Taken

### Endpoint

```http
PATCH /medication-logs/:id/taken
```

Example:

```text
PATCH /api/v1/medication-logs/LOG_ID/taken
```

When the dose is marked as taken:

```text
status = taken
takenAt = current time
skippedAt = null
```

---

# Mark Dose as Skipped

### Endpoint

```http
PATCH /medication-logs/:id/skipped
```

Example:

```text
PATCH /api/v1/medication-logs/LOG_ID/skipped
```

When the dose is skipped:

```text
status = skipped
skippedAt = current time
takenAt = null
```

A skip reason may optionally be stored.

---

# Medication History and Adherence

Medication history allows users to see their medication activity over a selected period.

Supported periods:

```text
week
month
2months
```

The backend calculates the requested date range relative to the current date.

### Examples

```text
week
```

returns approximately the previous 7 days.

```text
month
```

returns approximately the previous 30 days.

```text
2months
```

returns approximately the previous 60 days.

---

# Medication Log Generation

The backend contains a utility for generating scheduled medication occurrences.

```text
utils/medicationLogGenerator.js
```

The generator uses the medication's:

* Start date
* End date
* Frequency
* Schedule times

to determine when medication doses should occur.

For example:

```text
Frequency: twice_daily

Schedule:
07:00
19:00
```

The generator creates two scheduled occurrences per applicable day.

---

# Adherence Calculation

Adherence is calculated using:

```text
Adherence Rate =
(Total Taken / Total Scheduled) × 100
```

Example:

```text
Scheduled doses = 20
Taken doses = 18

Adherence =
(18 / 20) × 100

= 90%
```

Skipped doses are therefore counted as scheduled doses that were not taken.

Pending doses are also considered when calculating the appropriate historical period.

---

# Important Medication History Rules

The medication history logic considers:

* Medication start date
* Medication end date
* Requested history period
* Medication frequency
* Scheduled times
* Active/archived status
* Multiple doses per day
* Medications that have not started
* Medications that have already ended
* `as_needed` medications

A medication should not generate scheduled occurrences before its start date.

A medication should not generate scheduled occurrences after its end date.

`as_needed` medications do not generate automatic scheduled occurrences because they are taken according to need rather than a fixed schedule.

---

# Symptoms

The symptom system allows users to record symptoms and monitor them over time.

A symptom record can contain information such as:

```text
Symptom
├── profile
├── symptom
├── severity
├── timestamp
└── follow-up information
```

Severity can be used to indicate how significant the symptom is.

---

# Symptom Flow

The intended symptom flow is:

```text
User logs symptom
       ↓
Selects severity
       ↓
Reviews information
       ↓
Symptom is saved
       ↓
Follow-up cycle begins
       ↓
User receives follow-up prompt
```

The follow-up logic can be used to monitor symptoms over a defined period.

The current design uses a **3-day follow-up cycle**.

---

# OTP Delivery

The backend supports OTP delivery through:

```text
Email
SMS
```

The user's selected contact method determines which service is used.

---

# Email OTP

The project uses the **Resend API** for email delivery.

The email utility uses:

```text
RESEND_API_KEY
```

The email sender is configured through the Resend account.

Example:

```javascript
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
```

OTP emails contain the verification code and its expiration information.

---

# SMS OTP

SMS OTP delivery uses Twilio.

The backend requires:

```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

The backend sends the OTP through the Twilio API.

---

# Error Handling

The backend uses centralized error handling.

Errors are returned in a consistent format.

Example:

```json
{
  "success": false,
  "message": "An unexpected error occurred.",
  "code": "INTERNAL_SERVER_ERROR",
  "requestId": "REQUEST_ID"
}
```

The `requestId` can be used to locate the corresponding error in server logs.

---

# Logging

The backend includes request logging.

Logs contain information such as:

```text
timestamp
level
requestId
HTTP method
path
status code
duration
userId
message
```

Example:

```json
{
  "timestamp": "2026-09-05T12:00:00.000Z",
  "level": "info",
  "type": "http_request",
  "requestId": "REQUEST_ID",
  "method": "POST",
  "path": "/api/v1/users/register",
  "statusCode": 200,
  "durationMs": 150
}
```

This makes debugging deployed requests easier.

---

# Testing with Postman

Postman can be used to test the API independently of the frontend.

## 1. Start the backend

```bash
npm run dev
```

## 2. Test the health/root endpoint

```http
GET http://localhost:5000/
```

The deployed version can be tested with:

```http
GET https://mycare-backend-23oc.onrender.com/
```

A successful response indicates that the server is running.

---

## 3. Register

```http
POST http://localhost:5000/api/v1/users/register
```

Body:

```json
{
  "name": "Test User",
  "email": "your-email@gmail.com",
  "password": "Password123"
}
```

---

## 4. Verify OTP

Use the OTP received by email or SMS.

```http
POST http://localhost:5000/api/v1/users/verify-otp
```

Use the request format implemented by the authentication controller.

---

## 5. Login

```http
POST http://localhost:5000/api/v1/users/login
```

Example:

```json
{
  "email": "your-email@gmail.com",
  "password": "Password123"
}
```

---

# Deployment

The backend can be deployed as a **Render Web Service**.

The GitHub repository contains the source code, while Render runs the backend server.

The deployment flow is:

```text
GitHub
   ↓
Render
   ↓
Node.js / Express
   ↓
MongoDB Atlas
```

---

# Render Configuration

For a backend located in the `backend` directory, configure Render to use the backend directory as the working/root directory if required by the repository structure.

The start command is:

```bash
npm start
```

The project should have:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

Render automatically provides the `PORT` environment variable.

The application should therefore listen using the environment variable:

```javascript
const PORT = process.env.PORT || 5000;
```

This allows:

```text
Local development → port 5000
Render → Render-provided PORT
```

---

# Render Environment Variables

Do not put production secrets inside GitHub.

Instead, add them in:

```text
Render
→ Your Service
→ Environment
→ Environment Variables
```

Add the required variables there.

Example:

```text
MONGODB_URI
JWT_SECRET
RESEND_API_KEY
EMAIL_FROM
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
```

The actual secret values should never be placed in this README.

---

# Render API URL

The deployed backend is available at:

```text
https://mycare-backend-23oc.onrender.com
```

API base:

```text
https://mycare-backend-23oc.onrender.com/api/v1
```

Registration:

```text
https://mycare-backend-23oc.onrender.com/api/v1/users/register
```

---

# Frontend Connection

The frontend should use the deployed backend URL when the application is running in production.

Example:

```text
https://mycare-backend-23oc.onrender.com/api/v1
```

The frontend should then append the appropriate endpoint.

For example:

```text
/api/v1/users/register
```

becomes:

```text
https://mycare-backend-23oc.onrender.com/api/v1/users/register
```

---

# CORS

The backend must allow requests from the frontend's deployed origin.

During development, the frontend and backend may run on different localhost ports.

For example:

```text
Frontend:
http://localhost:3000

Backend:
http://localhost:5000
```

For production, the backend CORS configuration should include the actual deployed frontend URL.

---

# Security

The following information must remain private:

* MongoDB connection string
* JWT secret
* Resend API key
* Twilio Account SID
* Twilio Auth Token
* Other API credentials
* Passwords

Never commit these values to GitHub.

Use environment variables instead.

---

# Git Workflow

Each developer should work on their own feature branch.

Example:

```bash
git checkout -b feature/health-tracking
```

After making changes:

```bash
git status
```

Review the changes:

```bash
git diff
```

Stage the changes:

```bash
git add .
```

Commit using a meaningful conventional-style commit message:

```bash
git commit -m "feat: implement medication adherence tracking"
```

Push the branch:

```bash
git push origin feature/health-tracking
```

Then create a Pull Request on GitHub.

---

# Updating the Deployed Backend

When changes are merged into the branch connected to Render, Render can automatically deploy the new commit.

The deployment process is:

```text
Developer
   ↓
Git commit
   ↓
Git push
   ↓
Pull Request
   ↓
Merge
   ↓
GitHub
   ↓
Render detects changes
   ↓
Render builds/deploys backend
```

After deployment, test the API again using Postman.

---

# Troubleshooting

## Server does not start

Run:

```bash
npm start
```

Check the terminal for errors.

Also verify:

```bash
npm install
```

has been run.

---

## MongoDB connection fails

Check:

```env
MONGODB_URI=...
```

Make sure the connection string is correct and the MongoDB Atlas network access configuration allows the deployed backend to connect.

---

## OTP email fails locally

Check:

```env
RESEND_API_KEY=...
```

Also verify the sender configuration in Resend.

---

## OTP email works locally but fails on Render

Check the Render environment variables.

Make sure:

```text
RESEND_API_KEY
EMAIL_FROM
```

are configured in Render.

Remember that local `.env` variables are not automatically transferred to Render.

---

## API returns 500

Check the Render logs.

Use the returned:

```text
requestId
```

to identify the corresponding error.

For example:

```json
{
  "code": "INTERNAL_SERVER_ERROR",
  "requestId": "..."
}
```

Search the Render logs around the same time for that request.

---

# Health Check

The backend root endpoint can be used to check whether the server is running:

```http
GET /
```

Local:

```text
http://localhost:5000/
```

Production:

```text
https://mycare-backend-23oc.onrender.com/
```

A successful response confirms that the Express server is reachable.

---

# Backend Responsibilities

The backend is responsible for:

### Authentication

* User registration
* Password hashing
* Login
* JWT authentication
* OTP generation
* OTP verification
* Email OTP delivery
* SMS OTP delivery

### Profiles

* Create profiles
* View profiles
* Update profiles
* Manage profile information

### Medications

* Add medications
* View medications
* Update medications
* Archive medications
* Manage medication schedules

### Medication Tracking

* Generate scheduled medication occurrences
* Mark doses as taken
* Mark doses as skipped
* Record timestamps
* Retrieve medication history
* Calculate adherence

### Symptoms

* Create symptom records
* View symptom history
* Update symptoms
* Delete symptoms
* Record severity
* Handle follow-up records
* Support follow-up reminders

---

# Design Principle

The backend follows a separation of responsibilities:

```text
Routes
  ↓
Controllers
  ↓
Models / Database
  ↓
Utilities / Services
```

### Routes

Define the API endpoints.

### Controllers

Contain application/business logic.

### Models

Define the MongoDB data structures.

### Utilities

Contain reusable functionality such as:

* Password hashing
* OTP delivery
* Medication schedule generation

### Middleware

Handles cross-cutting functionality such as:

* Authentication
* Error handling
* Request logging

---

# Development Notes

When adding a new feature, keep related functionality separated into:

```text
Model
Controller
Route
```

For example:

```text
medicationLog.model.js
medicationLog.controller.js
medicationLog.route.js
```

This makes the backend easier to maintain and allows different team members to work on different features.

---

# Project Repository

GitHub repository:

https://github.com/capstoneadvmay26/mycare/

---

# Deployed Backend

Render:

https://mycare-backend-23oc.onrender.com

API base:

https://mycare-backend-23oc.onrender.com/api/v1

---

# Status

The backend is under active development as part of the MyCare capstone project.

Features are implemented progressively and may change as the frontend, authentication system, medication management, adherence tracking, and symptom tracking are integrated.
