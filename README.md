# Campus Connect

A faculty-student appointment booking system for a college/university, built with a React frontend and Express.js backend using MongoDB.

---

## Overview

Campus Connect allows students to discover professors, view their research and specializations, and book appointment slots. Teachers can manage their availability, update their profiles, and track student appointments.

---

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v4.21.2
- **Database**: MongoDB with Mongoose ODM v8.10.1
- **Authentication**: JWT (jsonwebtoken v9.0.2) + bcryptjs
- **Email**: Nodemailer (Gmail SMTP)
- **Validation**: express-validator v7.2.1

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React, React Icons
- **HTTP Client**: Axios

---

## Project Structure

```
campusconnect/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db-config.js       # MongoDB connection
│   │   │   └── server-config.js   # Server settings
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js  # Login JWT verification
│   │   │   └── otpMiddleware.js    # OTP verification middleware
│   │   ├── models/
│   │   │   ├── EmailOtp.js        # OTP storage (TTL: 5 min)
│   │   │   ├── student.js         # Student model
│   │   │   └── teachers.js        # Teacher model
│   │   ├── routes/v1/
│   │   │   ├── loginRoutes.js     # Auth routes
│   │   │   ├── otpRoutes.js       # OTP routes
│   │   │   ├── slotsRoutes.js     # Appointment slot routes
│   │   │   └── teachersRoutes.js   # Teacher routes
│   │   └── utils/
│   │       └── otpHelper.js       # Email sending utility
│   ├── index.js                   # Express entry point
│   ├── seed.js                    # Database seeder
│   └── package.json
│
├── testauto-main/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashBoard.jsx      # Older student dashboard
│   │   │   ├── DashTeacher.jsx    # Teacher dashboard
│   │   │   ├── Hero.jsx           # Student dashboard (main)
│   │   │   ├── Login.jsx          # Login page
│   │   │   └── Sign.jsx           # Registration page
│   │   ├── App.jsx                # Router config
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Tailwind styles
│   └── package.json
│
└── improvements.md                # Planned enhancements
```

---

## Features

### Student Features
- **OTP Registration**: 3-step signup with thapar.edu email verification
- **Login**: Email/password authentication
- **Search Teachers**: By name, department, specialization, research paper, or availability
- **View Profiles**: See teacher details (room, email, specializations, papers)
- **Book Slots**: Reserve available appointment slots
- **Manage Appointments**: View and cancel booked appointments

### Teacher Features
- **Login**: Email/password authentication
- **Profile Management**: Update contact info, add/remove specializations and research papers
- **Slot Management**: Add availability slots, reschedule, remove slots
- **Appointment Tracking**: View booked appointments with student details, cancel appointments

### System Features
- JWT-based authentication (two separate flows for OTP verification vs login)
- MongoDB with Mongoose ODM
- Email OTP delivery via Gmail SMTP
- Input validation with express-validator
- CORS-enabled API
- Database seeding for initial teacher data

---

## API Endpoints

### OTP Routes (`/api/v1/otp`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/generateOTP` | None | Generate and email 6-digit OTP |
| POST | `/verifyotp` | OTP Token | Verify OTP, returns verified JWT |

### Login Routes (`/api/v1/login`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/registerStudent` | Verified JWT | Register student after OTP verification |
| POST | `/studentLogin` | None | Student login |
| POST | `/teacherLogin` | None | Teacher login |
| GET | `/student/profile` | JWT | Get student profile |

### Teacher Routes (`/api/v1/teachers`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | JWT | Get own profile with slots |
| GET | `/getTeacher/:id` | None | Get teacher by ID |
| GET | `/getTeachers` | None | Search teachers by name |
| GET | `/getTeachersByDept` | None | Filter by department |
| GET | `/searchBySpecialization` | None | Search by specialization |
| GET | `/searchByPaper` | None | Search by research paper |
| GET | `/searchByAvailability` | None | Search by availability |
| POST | `/addTeacher` | None | Create teacher (no auth) |
| POST | `/addResearchPaper` | JWT | Add research paper |
| POST | `/addSpecialization` | JWT | Add specialization |
| PUT | `/updateContact` | JWT | Update contact info |
| DELETE | `/deleteResearchPaper/:title` | JWT | Delete research paper |

### Slot Routes (`/api/v1/slots`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookSlots` | JWT | Book a slot |
| POST | `/addSlot` | JWT | Add availability slot |
| POST | `/cancelSlot` | JWT | Cancel a booked slot |
| GET | `/retriveSlots` | JWT | Get student's booked slots |
| PUT | `/updateSlot/:id` | None | Update slot time (no auth) |

---

## Authentication Flow

### Student Registration
1. POST `/otp/generateOTP` with thapar.edu email
2. Receive 6-digit OTP via email
3. POST `/otp/verifyotp` with OTP
4. Receive JWT with `verified: true` claim
5. POST `/login/registerStudent` with this JWT + profile details
6. POST `/login/studentLogin` to get session token

### Teacher Login
1. POST `/login/teacherLogin` with email/password
2. Receive JWT with `userId` claim

---

## Database Models

### Student
```
firstName, lastName, email, roll, password (hashed)
```

### Teacher
```
firstName, lastName, email, department [CSED|ECED],
roomNumber, specialization[], papers[{title, journal}],
slots[{student, status, time}], password (hashed)
```

### EmailOtp
```
email, OTP (6-digit), createdAt (TTL index, 5 min expiry)
```

---

## Current State

### Working
- OTP-based student registration with email verification
- Teacher and student login flows
- Teacher profile management
- Slot booking and cancellation
- Search by department, name, specialization, paper, availability
- Modern responsive UI with Tailwind CSS

### Known Issues
1. **Security**: Several endpoints lack authentication (`PUT /updateSlot/:id`, `POST /addTeacher`, `GET /getTeacher/:id`)
2. **Concurrency**: Slot booking uses non-atomic operations — possible double-booking under load
3. **Missing Endpoint**: `DELETE /deleteSlot/:id` called by frontend but not implemented
4. **Environment-driven URLs**: Frontend now reads `VITE_API_URL`; set it before production build
5. **Duplicate Code**: `teachersRoutes.js` has duplicate `addTeacher` route definitions
6. **No Rate Limiting**: OTP and login endpoints vulnerable to brute force
7. **No Password Reset**: Forgot password not implemented
8. **Stale Component**: `DashBoard.jsx` references non-existent routes

---

## Planned Improvements
(as noted in `improvements.md`)
- Enhanced UI/UX with minimalist modern design
- Rate limiting implementation
- Additional security features
- Improved search functionality
- Concurrent booking handling for slots

---

## Running the Project

### Prerequisites
- Node.js
- MongoDB instance (local or Atlas)
- Gmail app password for OTP emails

### Backend
```bash
cd backend
npm install
# Configure .env with MONGOURI, PORT, JWT_SECRET, gmail_key
npm run dev  # or node index.js
```

### Frontend
```bash
cd testauto-main
npm install
npm run dev
```

### Production Deploy
Use two separate deploy targets.

Backend:
```bash
cd backend
npm install
npm start
```
Set `MONGOURI`, `JWT_SECRET`, `gmail_user`, `gmail_key`, `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`, and `FRONTEND_URLS` to your frontend origin.

Frontend:
```bash
cd testauto-main
npm install
npm run build
```
Set `VITE_API_URL` to your deployed backend URL before building.

---

## Environment Variables

### Backend (.env)
```
MONGOURI=t
PORT=8000
JWT_SECRET=your-secret-key
gmail_key=your-gmail-app-password
FRONTEND_URLS=https://your-frontend-domain.com
```
