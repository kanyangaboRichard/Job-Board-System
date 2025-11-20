Job Board System

A full-stack Job Board platform where users can browse jobs, 
apply, track their application status, and receive email notifications. 
Administrators can manage companies, jobs, 
applications, and generate monthly PDF reports.

Tech Stack
Frontend
React + TypeScript
Vite
Redux Toolkit
React Router
Axios
JWT authentication
Google OAuth
Hosted on Vercel

Backend

Node.js + Express (TypeScript)
PostgreSQL (Render)
JWT Authentication
Google OAuth 2.0
Nodemailer
jsPDF + html2canvas
Hosted on Render

Database

PostgreSQL
Tables:
users
jobs
companies
applications
admin_reports

Features

 User Features
Register/Login with email + password
Login with Google OAuth
Browse and search jobs
Apply for jobs
View application status
Receive email notifications
View profile info

Admin Features

Manage companies
Manage jobs
Manage applications
Accept or reject with notes
Promote users to admin
Generate monthly PDF reports

Authentication Flow
Local Login

Password hashing with bcrypt
Backend returns JWT
Token stored in localStorage
Protected routes require valid token
Google OAuth Login
Redirect to /api/auth/google
Google verifies identity
Backend returns JWT
Redirects to frontend with token

Deployment
Deploy PostgreSQL database on Neon
Add all backend .env variables
Add Vercel domain to CORS

Frontend on Vercel
Import GitHub repository
Add .env variables
Build command:

PDF Reporting (Admin)
Total jobs created
Total applications
Accepted vs rejected
Filter by company
Download as PDF

Email Notifications
Sent when:
Application submitted
Application accepted
Application rejected (with reason)

 Testing
Backend (Jest + Supertest)
