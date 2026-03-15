# Testikko — Competency Assessment & Development Platform

## Project Overview

A web application for assessing and developing employee competencies (professional/technical and HSE/safety). Core features: define competencies and questions, generate and assign tests by job position, track results, assign courses, and visualize KPIs via dashboards.

- **Deployment**: On-premise bare-metal servers, accessible over local network via HTTPS
- **No containers** (Docker or similar are not permitted)
- **Target devices**: Desktop and laptop computers only

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router + API Route Handlers) |
| Language | TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Auth.js v5) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Testing | Jest + React Testing Library |

> **Note**: Vercel is listed as a possible deployment target, but the actual deployment must be on-premise. Use Next.js standalone output mode for self-hosting.

---

## Application Design Style

Based on the reference design (`requirements/MainDesign.png`), the application follows a modern corporate SaaS aesthetic:

### Layout
- **Split-screen layout** for auth pages (login, change-password): left side contains the form on a clean white background, right side features a dark decorative panel with branding/illustrations
- **Dashboard/main app** uses a sidebar navigation layout with a top header bar

### Color Palette
| Role | Color | Usage |
|---|---|---|
| Primary background | `#F8F9FC` (soft off-white) | Content areas, main background |
| Card background | `#FFFFFF` (white) | Forms, cards, popovers |
| Dark panel | `#1E1E2D` → `#2A2A3C` (deep purple-black gradient) | Auth right panel, sidebar navigation, dark sections |
| Primary accent | `#2563EB` → `#3B82F6` (bright blue) | Buttons, active states, links, highlights |
| Text primary | `#111827` (near-black) | Headings, body text |
| Text secondary | `#6B7280` (gray-500) | Labels, helper text, placeholders |
| Border/divider | `#E5E7EB` (gray-200) | Input borders, card borders, dividers |
| Success | `#10B981` (green) | Pass indicators, confirmations |
| Danger | `#EF4444` (red) | Fail indicators, errors, locked status |
| Warning | `#F59E0B` (amber) | Pending states, warnings |

### Typography
- **Font family**: Plus Jakarta Sans (Google Fonts, loaded via Next.js font optimization)
- **Headings**: Bold, dark, generous spacing
- **Body text**: Regular weight, secondary gray for labels

### Components Style
- **Input fields**: Rounded corners (`rounded-lg`), light gray border, generous padding, subtle focus ring in primary blue
- **Buttons**: Fully rounded or `rounded-lg`, solid primary blue fill, white text, hover darkens slightly
- **Cards**: White background, subtle shadow (`shadow-sm`), rounded corners (`rounded-xl`)
- **Navigation tabs**: Underline-style active indicator in primary blue
- **Sidebar**: Dark purple-black background (`#1E1E2D`), muted light text (`#B0B0C3`), active item highlighted with blue accent on `#2A2A3C` background
- **Tables**: Clean borders, alternating row shading, rounded container

### Design Principles
- Minimalist and clean — generous whitespace, no visual clutter
- Consistent spacing using Tailwind's spacing scale (4, 6, 8 units)
- Subtle shadows and borders instead of heavy outlines
- Professional corporate feel — no playful elements
- Dark sidebar contrasting with light content area

---

## Roles & Permissions

| Role | Capabilities |
|---|---|
| **ADMIN** | Full access to all application features and data |
| **MANAGER** | Manage employees, competencies, job positions, tests, and courses within their department; view reports for their employees; unlock/lock tests |
| **USER** | Take assigned tests; view own test results and dashboard |

---

## Database Schema

Use PostgreSQL with Prisma ORM. The schema below covers the required tables. Only implement tables relevant to this project.

### Core Tables

```
user_profile         — employees (username, email, password, sap_id, image_path, position_id, manager_id, hse_blocked, ...)
role                 — roles (ADMIN, MANAGER, USER)
user_profile_role    — user ↔ role mapping
organisational_unit  — org units / departments (hierarchical, company-linked)
position             — job positions (linked to hse_group)

competence           — competency catalog (name, description, type: PROFESSIONAL|HSE, indicator_level, passing_indicator, competence_group_id)
competence_group     — grouping of competencies
competence_family    — grouping of competence groups
competence_cluster   — top-level grouping

question             — questions (text, level, question_type, image_path, possible_answers JSON, correct_answers JSON, competence_id)
                       question_type: SINGLE_CHOICE | MULTIPLE_CHOICE | ORDERING | IMAGE_PLACEMENT

test_template        — reusable test templates (name, created_at)
test_template_competence — template ↔ competency mapping (number_of_questions per competency)
competence_equality  — question count per difficulty level for a competency within a test

test                 — test instances (name, type: HSE|TECHNICAL, total_time, iteration, parent_test_id, hse_group_id, created_by)
test_question        — test ↔ question mapping (randomly selected questions)
test_user_profile    — test ↔ assigned users

test_result          — result per user per test (passed, percentage, date_time, remaining_time, stopped)
test_answer          — per-question answer record (answer, correct, question_id, test_result_id)

hse_requirement_rating — HSE competency score per user/test (fulfill, score, competence_id)
requirement_rating     — Technical competency score per user/test (fulfill, rating)

course               — courses (name, description, path, info, table_of_contents, competence_id)
user_profile_course  — course assignment (user, course, test, confirmed, start_time)

notification         — in-app notifications (message, status, url, created_at, user_profile_id)

audit_log            — admin action log (actor_id, action, entity_type, entity_id, created_at)
```

> The reference `schema.sql` is from a similar application. Adapt only the tables above. Ignore: `action`, `menu_option`, `menu_option_role`, `permission`, `best_competence`, `statistics_competence`, `hse_stats_competence`, `position_stats`, `company` (single-company app).

---

## Environment Variables

Store all sensitive values as placeholders in `.env.local`:

```
DATABASE_URL=<DATABASE_URL>
NEXTAUTH_SECRET=<NEXTAUTH_SECRET>
NEXTAUTH_URL=<NEXTAUTH_URL>
SMTP_HOST=<SMTP_HOST>
SMTP_PORT=<SMTP_PORT>
SMTP_USER=<SMTP_USER>
SMTP_PASSWORD=<SMTP_PASSWORD>
SMTP_FROM=<SMTP_FROM>
```

---

## Security Requirements

### Critical
- Password policy: minimum 15 characters, must include uppercase, lowercase, and at least one special character
- Force password change on first login or within 3 days of admin-assigned password
- Account lockout after N failed login attempts (configurable)
- HTTPS enforced (configured at infrastructure level; add HSTS header)
- Role-based access control (RBAC) on all API routes and UI components
- Sensitive routes protected via NextAuth middleware
- SQL injection prevention via Prisma parameterized queries
- CSRF protection via NextAuth built-in mechanism
- Input validation with Zod on all API route handlers

### Nice to Have
- Rate limiting on `/api/auth/*` endpoints (e.g., upstash/ratelimit) — max N requests per IP
- Security headers via `next.config.ts`: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- Audit log: record admin/manager actions (who did what, when, on which entity)
- Session expiry and refresh token rotation

### Not Required
- OAuth / SSO (username + password only)
- 2FA / MFA

---

## Development Phases

### Phase 1 — Project Setup & Infrastructure

**Goal**: Establish the foundation: repo, tooling, database, auth skeleton.

- [ ] Initialize Next.js 15 project with TypeScript, Tailwind CSS v4, shadcn/ui
- [ ] Configure `next.config.ts` with security headers (CSP, X-Frame-Options, X-Content-Type-Options)
- [ ] Set up ESLint, Prettier, and path aliases
- [ ] Install and configure Prisma with PostgreSQL; create initial schema migration
- [ ] Define all Prisma models based on the database schema section above
- [ ] Configure NextAuth.js v5 with Credentials provider (username + password)
- [ ] Implement middleware for route protection by role
- [ ] Create base layout with role-aware navigation shell
- [ ] Set up environment variable structure with `.env.local` placeholders
- [ ] Write unit tests for auth utilities and Prisma seed script

**Deliverables**: Running app with login page, role-based routing, and seeded database.

---

### Phase 2 — User & Employee Management Module

**Goal**: Admin and Manager can manage employees and job positions.

- [ ] **Job Positions**: CRUD for `position` and `organisational_unit`; link positions to HSE groups
- [ ] **Employee management**: CRUD for `user_profile`; assign position, org unit, manager, HSE manager
- [ ] **Role management**: Assign/revoke roles per user
- [ ] **Password management**: Admin creates temporary password; user forced to change within 3 days on next login
- [ ] **Profile page** (all roles): change profile picture, change password (no other fields editable)
- [ ] **Test lockout management**: Admin/Manager UI to view users with locked tests (`hse_blocked`); ability to manually unlock
- [ ] Audit log entries for all admin user-management actions
- [ ] Unit tests for all API routes in this module

**Deliverables**: Full employee and position management with role assignment.

---

### Phase 3 — Competency & Question Management Module

**Goal**: Managers can define and maintain the competency catalog and question bank.

- [ ] **Competency catalog**: CRUD for `competence`, `competence_group`, `competence_family`, `competence_cluster`
- [ ] Competency types: `PROFESSIONAL` (technical) and `HSE` (safety)
- [ ] **Question bank**: CRUD for `question` per competency
  - Question types: Single-choice, Multiple-choice, Ordering (arrange answers in sequence), Image Placement (drag answers onto an image)
  - Fields: text, difficulty level (1–N), image upload, possible answers, correct answers
- [ ] Validation: unique question sets per competency (no overlap); warn on duplicate
- [ ] **Position–Competency mapping**: link which competencies are required for each job position
- [ ] Unit tests for all API routes in this module

**Deliverables**: Complete competency and question bank management.

---

### Phase 4 — Test Template & Test Generation Module

**Goal**: Managers create test templates and generate/assign tests to employee groups.

- [ ] **Test templates**: Create `test_template` with a list of competencies and question counts per competency
- [ ] **Competency equality config**: specify how many questions per difficulty level per competency (`competence_equality`)
- [ ] **Test generation**: From a template + job position group, randomly select questions from the question bank respecting level distribution; create `test` and `test_question` records
- [ ] **Test assignment**: Assign generated test to a group of employees (`test_user_profile`); send in-app notification and email
- [ ] Test types: `HSE` and `TECHNICAL`
- [ ] Support `parent_test_id` for retake tests (failed competencies only, new random questions)
- [ ] **Pending tests view**: Managers see all tests they created with status per employee
- [ ] Unit tests for test generation logic (question selection, level distribution)

**Deliverables**: End-to-end test creation and assignment workflow.

---

### Phase 5 — Test Taking Module (User Panel)

**Goal**: Employees take assigned tests with a guided, timed interface.

- [ ] **Pending tests dashboard**: Show all assigned tests with: name, created date, question count, time limit, status
- [ ] **Pre-test screen**: Display test instructions before starting
- [ ] **Test execution**:
  - One question displayed at a time
  - Optional image displayed with question
  - Question type support:
    - Single / Multiple choice
    - Ordering: drag-and-drop answers into correct sequence
    - Image Placement: drag answers onto designated zones of an image
  - Countdown timer; auto-submit on timeout
- [ ] **Post-test screen**: Graphical results summary (score per competency, overall pass/fail), review of correct and incorrect answers
- [ ] **Auto-retake logic**: If user fails one or more competencies, automatically generate a new test with only failed competencies (new random questions); increment `iteration`
- [ ] **Test lockout**: After failing the same test more than 2 times, lock the user (`hse_blocked = true`); notify responsible HSE manager
- [ ] Save `test_result`, `test_answer`, `hse_requirement_rating`, `requirement_rating` on submission
- [ ] Unit tests for scoring logic and auto-retake generation

**Deliverables**: Full test-taking experience with results and automatic retake generation.

---

### Phase 6 — Course Management & Assignment Module

**Goal**: Define courses and assign them based on test results or manually.

- [ ] **Course catalog**: CRUD for `course` (name, description, file/path, info, table of contents, linked competency)
- [ ] **Course assignment**: Assign courses to users (`user_profile_course`); link assignment to a specific test
- [ ] **User course view**: Employees see assigned courses; can confirm completion (`confirmed = true`)
- [ ] **Notification trigger**: If a user has not reviewed a course within 10 days of test completion, send in-app notification and email to the responsible HSE manager
- [ ] Unit tests for assignment and notification trigger logic

**Deliverables**: Course management with assignment and completion tracking.

---

### Phase 7 — Dashboards, Reporting & KPI Module

**Goal**: Role-scoped dashboards with KPIs, charts, filters, and reports.

#### KPI Cards (6 per dashboard)
- Total tests assigned
- Overall pass rate (%)
- Best-developed competency (highest avg score)
- Worst-developed competency (lowest avg score)
- Number of locked users
- Average score per job position

#### Charts (4 per dashboard)
- Test results over time (line chart)
- Competency scores per employee group (bar chart)
- Pass/fail distribution per test (pie/donut chart)
- Score distribution by job position (grouped bar chart)

#### Role scoping
| Role | Sees |
|---|---|
| USER | Own tests, own competency scores |
| MANAGER | Own data + all employees under their management |
| ADMIN | Everything; filter by Manager, User, Department, Test |

#### Features
- [ ] Filters: by manager, user, department, test, date range (Admin/Manager)
- [ ] Each chart has a fullscreen expand option
- [ ] Each chart shows a detail card/tooltip on hover with underlying data
- [ ] **Automatic report generation**:
  - Complete HSE test results report (PDF or printable view)
  - Complete Technical Competency test results report
- [ ] Unit tests for KPI calculation functions

**Deliverables**: Fully functional role-scoped dashboards with all KPIs and charts.

---

### Phase 8 — Notifications & Alerts Engine

**Goal**: In-app and email notifications for key events.

Implement a notification service that handles the following triggers:

| Event | Recipients | Channel |
|---|---|---|
| Test assigned | Assigned employee | In-app + email |
| Test failed > 2 times (locked) | Responsible HSE manager | In-app + email |
| Course not reviewed within 10 days of test end | Responsible HSE manager | In-app + email |
| Pending test reminder | Employee | In-app |

- [ ] `notification` table records all in-app notifications with `status` (UNREAD/READ)
- [ ] Email sending via SMTP (configurable via env variables)
- [ ] Scheduled job (Next.js API route triggered by a cron or external scheduler) to check the 10-day course review rule
- [ ] Unit tests for notification trigger conditions

**Deliverables**: Fully operational notification engine.

---

### Phase 9 — Security Hardening, Audit Logging & Final Testing

**Goal**: Harden security, finalize audit trail, and complete end-to-end testing.

- [ ] Audit log: record all admin and manager actions with actor, action type, entity, and timestamp
- [ ] Audit log viewer: accessible to ADMIN only, with filters
- [ ] Rate limiting on auth endpoints
- [ ] Review and finalize all security headers
- [ ] Account lockout after N failed login attempts; auto-unlock after timeout
- [ ] Document all implemented security mechanisms with category (Critical / Nice to Have / Not Required)
- [ ] Full unit test coverage for all modules
- [ ] Integration tests for critical user journeys (login, test taking, dashboard)
- [ ] Manual QA pass across all roles

**Deliverables**: Production-ready, security-hardened application.

---

## Common Commands

```bash
# Development
npm run dev

# Database
npx prisma migrate dev --name <migration_name>
npx prisma generate
npx prisma studio
npx prisma db seed

# Build
npm run build
npm start

# Testing
npm test
npm run test:coverage
```

---

## Project Structure (Recommended)

```
src/
  app/
    (auth)/           # Login, force-password-change pages
    (admin)/          # Admin panel pages
    (manager)/        # Manager panel pages
    (user)/           # User panel pages
    api/              # API route handlers
  components/
    ui/               # shadcn/ui components
    charts/           # Dashboard chart components
    test/             # Test-taking components
  lib/
    auth.ts           # NextAuth config
    prisma.ts         # Prisma client singleton
    notifications.ts  # Notification service
    email.ts          # SMTP email service
    scoring.ts        # Test scoring logic
  middleware.ts       # Route protection middleware
prisma/
  schema.prisma
  migrations/
  seed.ts
```

---

## Testing Strategy

- Run unit tests after each completed phase before moving to the next
- Use Jest for unit tests; React Testing Library for component tests
- Mock Prisma client in unit tests using `jest-mock-extended`
- Test all API route handlers independently
- Cover: scoring logic, test generation (question selection + level distribution), notification triggers, RBAC enforcement

---

## Notes

- All application UI, code, comments, and documentation must be in **English**
- Sensitive config values must always use placeholder format `<VARIABLE_NAME>` — never commit real credentials
- No Docker or containerization; use Next.js standalone build for deployment
- The `schema.sql` reference is from a similar application — use it as inspiration, not a direct template
