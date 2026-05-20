# Cloud-Based Student Assignment Submission System

A modern, full-stack platform for managing assignment submissions at **The University of Faisalabad**, Department of Computer Science. Built with Next.js, MongoDB, and Cloudinary.

> Submitted by **Dury Shahwar (BSSE-2022-078)** to **Sir Ibrar**.

---

## Highlights

- **Three roles** — Student, Teacher, and Admin, with dedicated dashboards and powers.
- **Cloud storage** — every file (assignment attachments, submissions, avatars) lives on Cloudinary with secure URLs.
- **Authentication** — bcrypt password hashing, JWT sessions in HTTP-only cookies, role-based access.
- **Forgot password via Gmail SMTP** — beautifully designed HTML email with a one-time reset link valid for 60 minutes.
- **Submission emails** — students get a confirmation receipt the moment their work is uploaded.
- **Smart deadlines** — auto-flag late submissions, optional strict-deadline lockouts.
- **Grading & feedback** — teachers grade with comments; students see results inline.
- **Admin panel** — manage every user (role, activate/deactivate, delete) and inspect all assignments.
- **Claude-inspired design** — warm cream palette, serif headings, coral accents, careful spacing.
- **Mobile responsive** — works gracefully on phones, tablets, and desktops.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS v4, Lucide icons, Google Fonts (Fraunces + Inter) |
| Database | MongoDB Atlas via Mongoose |
| File storage | Cloudinary |
| Auth | bcryptjs + jsonwebtoken (HTTP-only cookie sessions) |
| Email | Nodemailer with Gmail SMTP (app password) |

---

## Getting started

```bash
cd assignment-system
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Required environment variables (`.env`)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/assignment_system

JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d

# Gmail SMTP — use a Google App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME=TUF Assignment Portal
SMTP_FROM_EMAIL=your-email@gmail.com

# Admin (auto-seeded on first request)
ADMIN_EMAIL=admin@example.com
ADMIN_NAME=System Administrator
ADMIN_DEFAULT_PASSWORD=Admin@12345

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_FOLDER=tuf_assignment_portal

NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_URL=http://localhost:3000
MAX_FILE_SIZE_MB=25
```

The admin account is **created automatically** the first time the API is hit. Default credentials are taken from `ADMIN_EMAIL` / `ADMIN_DEFAULT_PASSWORD`. **Change the password from the Profile screen after first login.**

---

## Project structure

```
src/
├── app/
│   ├── (app)/                  # protected dashboards (student, teacher, admin, profile)
│   ├── api/                    # route handlers — auth, assignments, submissions, admin
│   ├── login/ register/        # auth pages
│   ├── forgot-password/        # request a reset link
│   ├── reset-password/[token]/ # complete a reset
│   ├── dashboard/              # redirects to role-specific dashboard
│   ├── globals.css             # Claude-inspired design tokens
│   ├── layout.tsx
│   └── page.tsx                # landing page
├── components/                 # shared UI (Brand, Avatar, DashboardShell, forms…)
├── lib/                        # db, auth, jwt, email, cloudinary, utils
├── models/                     # Mongoose schemas (User, Assignment, Submission)
└── proxy.ts                    # Next 16 middleware: route protection
```

---

## Roles & screens

| Role | Routes | Capabilities |
|---|---|---|
| **Student** | `/student/dashboard`, `/student/assignments`, `/student/assignments/[id]`, `/student/submissions` | Browse assignments, upload work, replace submissions, view grades & feedback |
| **Teacher** | `/teacher/dashboard`, `/teacher/assignments`, `/teacher/assignments/new`, `/teacher/assignments/[id]` | Create assignments with attachments, view submissions, download files, grade with feedback |
| **Admin** | `/admin/dashboard`, `/admin/users`, `/admin/assignments` | Manage users (role, activate/deactivate, delete), inspect all assignments |
| **Everyone** | `/profile` | Update name/department/avatar, change password |

---

## API endpoints

```
POST   /api/auth/register              Create account (student/teacher)
POST   /api/auth/login                 Sign in
POST   /api/auth/logout                Sign out
GET    /api/auth/me                    Current session info
POST   /api/auth/forgot-password       Email a reset link
POST   /api/auth/reset-password        Set a new password using token

GET    /api/assignments                List (filtered by role)
POST   /api/assignments                Create (teacher / admin)
GET    /api/assignments/:id            View one
DELETE /api/assignments/:id            Remove (owner / admin)
GET    /api/assignments/:id/submissions   List submissions

POST   /api/submissions                Submit / replace file (student)
GET    /api/submissions                List own (student) / all (teacher/admin)
POST   /api/submissions/:id/grade      Grade + feedback (teacher / admin)

PATCH  /api/profile                    Update profile (multipart) or change password (json)

GET    /api/admin/stats                Dashboard counters (admin)
GET    /api/admin/users                List users with filters (admin)
PATCH  /api/admin/users/:id            Change role / activate / deactivate (admin)
DELETE /api/admin/users/:id            Delete user and their data (admin)
```

---

## Notes

- Late-submission policy is configurable per-assignment.
- Resetting a password rotates the reset token immediately (single use, 60-minute expiry).
- File uploads use Cloudinary's `resource_type: "auto"` so PDFs, ZIPs, images, and code all work.
- Downloads are served via Cloudinary's `flags=attachment` for a proper filename.
- Mongoose model caching guards against Next.js's hot-reload.
- All Mongoose connections are cached on `globalThis` for serverless friendliness.

---

## License

Academic / educational project. © The University of Faisalabad.
