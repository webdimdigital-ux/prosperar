# Exam Management System — Project Specification

## Overview

A web-based platform for managing medical exams with three distinct access groups: **Client**, **Administrator**, and **Hospital**. The system handles exam uploads, listing, and access control with role-based permissions.

---

## Tech Stack

### Backend
- **Framework:** Laravel (PHP)
- **API:** GraphQL (via Lighthouse or laravel-graphql)
- **Database:** MySQL
- **Authentication:** Laravel Sanctum or JWT (per-role tokens)
- **PDF Processing:** `smalot/pdfparser` (text extraction) + `spatie/pdf-to-image` or `setasign/fpdi` (page splitting)
- **Containerization:** Docker + Docker Compose

### Frontend
- **Framework:** React + Vite
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS
- **GraphQL Client:** Apollo Client or urql
- **Containerization:** Docker + Nginx

### Infrastructure
- Docker Compose orchestrating: `app` (Laravel), `frontend` (React/Nginx), `db` (MySQL)
- Environment variables via `.env`
- Internal Docker network for inter-service communication

---

## Access Groups & Permissions

| Resource                          | Client | Admin | Hospital |
|-----------------------------------|--------|-------|----------|
| View own exams                    | ✅     | ✅    | ❌       |
| View all exams                    | ❌     | ✅    | ❌       |
| View exams by hospital_id         | ❌     | ❌    | ✅       |
| Upload exams                      | ❌     | ✅    | ❌       |
| Manage clients                    | ❌     | ✅    | ❌       |
| View clients from own hospital    | ❌     | ✅    | ✅       |
| Manage hospitals                  | ❌     | ✅    | ❌       |
| Edit own profile                  | ✅     | ✅    | ✅       |

---

## Modules & Screens

### 1. Client Module

#### 1.1 Home Screen — Login
- Fields: email, password
- Links: "Sign up" | "Forgot my password"
- Redirects to the client's exam list after successful login

#### 1.2 Password Recovery
- Step 1: Email input → send reset link/token via email
- Step 2: New password + confirmation via token
- Success/error feedback

#### 1.3 User Registration (public)
- Fields: full name, email, CPF, date of birth, phone, password, password confirmation
- Real-time validation
- Redirect to login after successful registration

#### 1.4 Exam List (Client)
- Lists exams linked to the authenticated client
- Columns: exam name, date, hospital, status, actions (view / download)
- **Sort:** by name, date, status
- **Search:** by exam name or hospital
- **Filters:** by status (pending, available, delivered), by date range (start date / end date)

#### 1.5 User Profile (Header — Floating Menu)
- Accessed via avatar/name at the top of the page
- Editable fields: name, phone, password
- Logout option

---

### 2. Admin Module

#### 2.1 Exam List (Admin)
- Global view of all exams in the system
- Columns: patient, hospital, exam name, date, status, actions
- **Sort:** by any column
- **Search:** by patient name, exam name, or hospital
- **Filters:** by status, hospital, date range

#### 2.2 Exam Upload
- Upload form for a multi-page PDF where **each page corresponds to one exam**
- Fields: select hospital, exam date, notes, file (PDF — multi-page)
- Required field validation
- File preview before submission
- Success/error feedback with a per-page processing summary (e.g. "12 of 13 pages processed successfully")

**PDF Processing Pipeline (backend):**
1. Admin uploads a single PDF containing N pages (one exam per page)
2. Backend splits the PDF into N individual single-page files using a PDF library (e.g. `spatie/pdf-to-image` or `smalot/pdfparser`)
3. For each page, the system performs text extraction to locate a **patient ID embedded in the document content** — this ID is what populates the `cpf` column and is used to identify/match the patient in the system
4. Each page is saved as an individual file in private storage
5. One `exams` record is created per page with:
   - `cpf` → extracted ID from the document text (serves as the patient identifier)
   - `client_id` → resolved by looking up `users.cpf` matched against the extracted ID
   - `hospital_id` → taken from the form selection
   - `file_path` → path to the individual split page
   - `status` → `pending` by default
6. Pages where ID extraction fails are flagged with `status = error` and listed in the admin feedback summary for manual review

#### 2.3 Clients Screen
- **List view:**
  - Columns: name, email, CPF, phone, registration date, actions (edit, deactivate)
  - **Sort:** by name, registration date
  - **Search:** by name, email, or CPF
  - **Filters:** by status (active / inactive)
- **Add Client:**
  - Same form as public registration with additional fields (linked hospital, status)

#### 2.4 Hospitals Screen
- List of registered hospitals
- Columns: name, CNPJ, city, phone, status, actions (edit, deactivate)
- **Sort:** by name, city
- **Search:** by name or CNPJ
- **Filters:** by status (active / inactive)
- **Add / Edit Hospital:**
  - Fields: name, CNPJ, address, city, state, phone, contact email

---

### 3. Hospital Module

#### 3.1 Exam List (Hospital)
- Displays only exams linked to the authenticated hospital
- Columns: patient, exam name, date, status, actions (view)
- **Sort:** by patient, date, status
- **Search:** by patient name or exam name
- **Filters:** by status, date range

#### 3.2 Client List (Hospital)
- Displays only clients with exams linked to the hospital
- Columns: name, CPF, phone, total exams, actions (view exams)
- **Sort:** by name, total exams
- **Search:** by name or CPF
- **Filters:** none required (extensible)

---

## Global Requirements

### All Listings Must Have
- **Sort** on relevant columns, toggling ASC/DESC
- **Search** with debounce (300ms recommended)
- **Filters** by context-specific criteria
- **Pagination** with configurable page size (10, 25, 50)
- Empty state with a friendly message ("No exams found")
- Loading skeleton during data fetching

### Responsiveness
- Fully responsive layout across mobile, tablet, and desktop
- Collapsible sidebar on smaller screens
- Tables with horizontal scroll on mobile or adaptive card layout

### UX Feedback
- Toast notifications for actions (success, error, warning)
- Confirmation modal for destructive actions (delete, deactivate)
- Loading indicators on action buttons

---

## Data Modeling (MySQL)

### Main Tables

```sql
users
  id, name, email, cpf, phone, birth_date,
  password, role ENUM('client', 'admin', 'hospital'),
  hospital_id (FK, nullable),   -- set for users with role = 'hospital'
  status, timestamps

hospitals
  id, name, cnpj, address, city, state,
  phone, email, status, timestamps

exams
  id, client_id (FK users, nullable),  -- resolved after CPF extraction; null if unmatched
  hospital_id (FK hospitals),          -- set from the upload form; drives hospital-level access
  cpf,                                 -- patient ID extracted from the PDF content; used as the patient identifier
  name, exam_date, file_path, observations,
  status ENUM('pending', 'available', 'delivered', 'error'),
  -- 'error' = CPF extraction or client matching failed
  uploaded_by (FK users), timestamps
```

> **Hospital access model:** There are no dedicated hospital accounts. Users with `role = 'hospital'` have a `hospital_id` on their user record. Access to exams and clients is determined by matching `users.hospital_id` against `exams.hospital_id` — not by a separate hospital login type.

---

## GraphQL API — Example Operations

### Queries

```graphql
# List exams with filters, sort, and pagination
query GetExams($filter: ExamFilterInput, $sort: ExamSortInput, $page: Int, $perPage: Int) {
  exams(filter: $filter, sort: $sort, page: $page, perPage: $perPage) {
    data {
      id
      name
      examDate
      status
      client { id name }
      hospital { id name }
    }
    paginatorInfo { total currentPage lastPage }
  }
}

# List clients
query GetClients($search: String, $filter: ClientFilterInput, $sort: ClientSortInput) {
  clients(search: $search, filter: $filter, sort: $sort) {
    data { id name email cpf phone status }
    paginatorInfo { total currentPage lastPage }
  }
}
```

### Mutations

```graphql
# Login
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user { id name role }
  }
}

# Upload exam
mutation UploadExam($input: UploadExamInput!) {
  uploadExam(input: $input) {
    id name status
  }
}

# Register user
mutation RegisterUser($input: RegisterUserInput!) {
  registerUser(input: $input) {
    id name email
  }
}
```

---

## Suggested Folder Structure

### Backend (Laravel)
```
app/
├── GraphQL/
│   ├── Mutations/
│   ├── Queries/
│   └── Types/
├── Models/
│   ├── User.php
│   ├── Hospital.php
│   └── Exam.php
├── Policies/          # Role-based access control
└── Services/          # Business logic
graphql/
└── schema.graphql
```

### Frontend (React + Vite)
```
src/
├── components/
│   ├── ui/            # shadcn components
│   ├── layout/        # Header, Sidebar, Layout
│   └── shared/        # DataTable, Filters, SearchBar
├── pages/
│   ├── auth/          # Login, Register, ForgotPassword
│   ├── client/        # ExamList, Profile
│   ├── admin/         # ExamList, UploadExam, Clients, Hospitals
│   └── hospital/      # ExamList, ClientList
├── graphql/
│   ├── queries/
│   └── mutations/
├── hooks/             # useAuth, useExams, etc.
└── context/           # AuthContext
```

---

## Docker Compose — Service Structure

```yaml
services:
  app:          # Laravel — php:8.2-fpm + nginx
  frontend:     # React — node build + nginx serve
  db:           # MySQL 8.0

networks:
  - app-network

volumes:
  - mysql-data
  - storage        # exam files
```

---

## Business Rules

1. A client can only view exams where `exams.cpf` matches the ID stored on their own user record (`users.cpf`)
2. A hospital user can only view exams where `exams.hospital_id` matches their `users.hospital_id`
3. **There are no standalone hospital accounts.** Hospital access is granted to users with `role = 'hospital'` via their `hospital_id` field
4. Only an Admin can upload, edit, or delete exams
5. Only an Admin can register hospitals and manage users
6. Public registration creates users with `role = client` and `status = active`
7. Exam files must be stored in private storage (not exposed via direct public URL)
8. File downloads must be served through an authenticated backend endpoint with permission checks

### PDF Processing Rules
9. Each page of the uploaded PDF is treated as one independent exam record
10. The system must extract the **patient ID** from the text content of each page — this ID is stored in the `cpf` column and acts as the patient identifier throughout the system
11. After extraction, the system attempts to match the extracted ID against `users.cpf` to populate `client_id`
12. If the ID is found in the text but no matching user exists, the exam is still created with `client_id = null` and `cpf` populated — the link can be resolved later when the user registers
13. If ID extraction fails entirely (text not found or unreadable), the exam record is created with `status = error` and flagged for manual admin review
14. The admin upload response must include a summary: total pages, successfully processed, and failed (with page numbers)

---

## Security Considerations

- Token-based authentication (JWT or Sanctum) on all protected routes
- Role-based authorization middleware on GraphQL resolvers
- Input validation and sanitization on the backend
- Exam files served via authenticated endpoint (never publicly accessible)
- CORS configured to allow only the frontend domain
- Rate limiting on authentication endpoints
