# Testikko — Implementation Plan

## Context

Building a greenfield Competency Assessment & Development Platform from scratch. No code exists yet — only `CLAUDE.md` (full spec), `requirements/requirement.txt`, and `requirements/schema.sql` (reference). The application enables companies to define competencies, create tests per job position, assess employees, assign courses, and visualize KPIs.

**Key reference file**: `/home/nikola/Testikko/CLAUDE.md` — the complete specification driving all implementation decisions.

---

## Local Run Milestones

| After Phase | What Works Locally |
|---|---|
| **Phase 1** | `npm run dev` → Login page, role-based routing, seeded DB |
| **Phase 2** | + User/employee/position CRUD, profile, password lifecycle |
| **Phase 3** | + Competency tree, question bank |
| **Phase 4** | + Test templates, generation, assignment |
| **Phase 5** | + Users take tests, results, retakes, lockout |
| **Phase 6** | + Course management, completion tracking |
| **Phase 7** | + Dashboards with KPIs, charts, reports |
| **Phase 8** | + Notifications (in-app + email) |
| **Phase 9** | Production-ready, hardened, fully tested |

---

## PHASE 1 — Project Setup & Infrastructure (14 tasks)

**Goal**: Running app with login page, role-based routing, and seeded database.
**🟢 RUNNABLE LOCALLY AFTER THIS PHASE**

### Task 1.1 — Initialize Next.js 15 project with TypeScript
- **Status**: NOT_STARTED
- **Dependencies**: None
- **Files**: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `.gitignore`
- **Actions**:
  1. `npx create-next-app@latest . --typescript --app --src-dir --no-tailwind --no-eslint`
  2. `git init`
  3. Verify: `npm run dev` serves page at localhost:3000

### Task 1.2 — Configure Tailwind CSS v4 and shadcn/ui
- **Status**: NOT_STARTED
- **Dependencies**: 1.1
- **Files**: `src/app/globals.css`, `components.json`, `src/lib/utils.ts`, `postcss.config.mjs`
- **Actions**:
  1. `npm install tailwindcss @tailwindcss/postcss postcss`
  2. Configure postcss, add `@import "tailwindcss"` to globals.css
  3. `npx shadcn@latest init` → New York style, CSS variables
  4. `npx shadcn@latest add button` (verify setup)
- **Verify**: Button renders with Tailwind styles

### Task 1.3 — ESLint, Prettier, and path aliases
- **Status**: NOT_STARTED
- **Dependencies**: 1.1
- **Files**: `.eslintrc.json`, `.prettierrc.json`, `.prettierignore`, `tsconfig.json`
- **Actions**: Install ESLint + Prettier, configure `@/*` → `src/*` alias
- **Verify**: `npm run lint` passes

### Task 1.4 — Security headers in next.config.ts
- **Status**: NOT_STARTED
- **Dependencies**: 1.1
- **Files**: `next.config.ts`
- **Actions**: Add CSP, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy, HSTS. Set `output: "standalone"`
- **Verify**: Headers visible in browser DevTools

### Task 1.5 — Environment variable structure
- **Status**: NOT_STARTED
- **Dependencies**: 1.1
- **Files**: `.env.example`, `src/lib/env.ts`
- **Actions**: Create `.env.example` with all placeholders (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, SMTP_*). Optional Zod runtime validation in `env.ts`
- **Verify**: `.env.example` exists, `.env.local` is gitignored

### Task 1.6 — Prisma setup and full schema definition
- **Status**: NOT_STARTED
- **Dependencies**: 1.5
- **Key file**: `prisma/schema.prisma`, `src/lib/prisma.ts`
- **Actions**:
  1. `npm install prisma @prisma/client && npx prisma init`
  2. Define ALL models per CLAUDE.md: UserProfile, Role, UserProfileRole, OrganisationalUnit, Position, HseGroup, HseGroupCompetence, Competence, CompetenceGroup, CompetenceFamily, CompetenceCluster, Question, TestTemplate, TestTemplateCompetence, CompetenceEquality, Test, TestQuestion, TestUserProfile, TestResult, TestAnswer, HseRequirementRating, RequirementRating, Course, UserProfileCourse, Notification, AuditLog
  3. Enums: Role (ADMIN/MANAGER/USER), CompetenceType (PROFESSIONAL/HSE), QuestionType (SINGLE_CHOICE/MULTIPLE_CHOICE/ORDERING/IMAGE_PLACEMENT), TestType (HSE/TECHNICAL), NotificationStatus (UNREAD/READ)
  4. Key fields: `password_changed_at`, `failed_login_attempts`, `locked_until` on UserProfile
  5. Self-relations: manager_id, hse_manager_id, organisational_unit_superior_id, parent_test_id
  6. Singleton client in `src/lib/prisma.ts`
- **Verify**: `npx prisma validate` passes

### Task 1.7 — Initial database migration
- **Status**: NOT_STARTED
- **Dependencies**: 1.6, PostgreSQL running
- **Files**: `prisma/migrations/<timestamp>_init/migration.sql`
- **Actions**: `npx prisma migrate dev --name init && npx prisma generate`
- **Verify**: `npx prisma studio` shows all tables

### Task 1.8 — Seed script
- **Status**: NOT_STARTED
- **Dependencies**: 1.7
- **Files**: `prisma/seed.ts`
- **Actions**: Seed 3 roles, 1 admin user (password_changed_at: null), 2 org units, 2 positions with HSE group, 1 manager user, 2 regular users. Use bcryptjs for password hashing. Add `"prisma": { "seed": "npx tsx prisma/seed.ts" }` to package.json
- **Verify**: `npx prisma db seed` succeeds

### Task 1.9 — NextAuth.js v5 with Credentials provider
- **Status**: NOT_STARTED
- **Dependencies**: 1.6, 1.8
- **Key files**: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/lib/auth-utils.ts`, `src/types/next-auth.d.ts`
- **Actions**:
  1. `npm install next-auth@beta @auth/prisma-adapter bcryptjs @types/bcryptjs`
  2. Credentials provider: lookup by username, verify bcrypt
  3. JWT token includes: id, roles, passwordChangedAt
  4. Session callback exposes roles and passwordChangedAt
  5. Password validation utility: min 15 chars, uppercase, lowercase, special char
- **Verify**: POST to `/api/auth/signin` with seeded credentials returns valid session

### Task 1.10 — Middleware for route protection by role
- **Status**: NOT_STARTED
- **Dependencies**: 1.9
- **Key file**: `src/middleware.ts`
- **Actions**:
  - Unauthenticated → redirect to `/login`
  - password_changed_at null or expired → redirect to `/change-password`
  - `/(admin)/*` → ADMIN only
  - `/(manager)/*` → ADMIN or MANAGER
  - `/(user)/*` → any authenticated user
- **Verify**: Unauthenticated access to `/admin` → `/login`. USER accessing `/admin` → redirect

### Task 1.11 — Login page and force-password-change page
- **Status**: NOT_STARTED
- **Dependencies**: 1.9, 1.10, 1.2
- **Files**: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/change-password/page.tsx`, `src/app/(auth)/layout.tsx`, `src/app/api/auth/change-password/route.ts`
- **Actions**: Login form (username + password), change-password form (old, new, confirm), API route validates policy and updates, centered auth layout
- **Verify**: Login with seeded admin → forced to change-password → redirected to dashboard

### Task 1.12 — Base layout with role-aware navigation
- **Status**: NOT_STARTED
- **Dependencies**: 1.9, 1.2
- **Files**: `src/app/(admin)/layout.tsx`, `src/app/(manager)/layout.tsx`, `src/app/(user)/layout.tsx`, `src/components/navigation/sidebar.tsx`, `src/components/navigation/nav-items.ts`, `src/components/navigation/user-menu.tsx`, placeholder dashboard pages
- **Actions**:
  - Sidebar with role-based nav items
  - ADMIN: Dashboard, Users, Positions, Competencies, Questions, Tests, Courses, Notifications, Audit Log
  - MANAGER: Dashboard, Employees, Competencies, Questions, Tests, Courses, Notifications
  - USER: Dashboard, My Tests, My Courses, Profile
  - User menu: username, role badge, profile, sign out
- **Verify**: Admin sees admin sidebar. Navigation matches role

### Task 1.13 — Jest and React Testing Library setup
- **Status**: NOT_STARTED
- **Dependencies**: 1.1
- **Files**: `jest.config.ts`, `jest.setup.ts`
- **Actions**: Install Jest, RTL, jest-mock-extended. Configure moduleNameMapper for `@/` aliases. Add test scripts
- **Verify**: `npm test -- --passWithNoTests` runs

### Task 1.14 — Unit tests for auth utilities
- **Status**: NOT_STARTED
- **Dependencies**: 1.9, 1.13
- **Files**: `src/__tests__/lib/auth-utils.test.ts`
- **Actions**: Test password validation (length, uppercase, lowercase, special), hashing round-trip, role checking
- **Verify**: `npm test` passes

---

## PHASE 2 — User & Employee Management (11 tasks)

**Goal**: Full employee and position CRUD with role assignment.

### Task 2.1 — Zod validation schemas
- **Status**: NOT_STARTED
- **Dependencies**: Phase 1
- **Files**: `src/lib/validations/user.ts`, `position.ts`, `organisational-unit.ts`
- **Actions**: `npm install zod`. Schemas for CreateUser, UpdateUser, CreatePosition, UpdatePosition, CreateOrgUnit, AssignRole, ChangePassword

### Task 2.2 — CRUD API routes: organisational_unit
- **Status**: NOT_STARTED
- **Dependencies**: 2.1
- **Files**: `src/app/api/organisational-units/route.ts`, `[id]/route.ts`, `src/lib/api-utils.ts`
- **Actions**: GET list, POST create (ADMIN), PUT update (ADMIN), DELETE. Shared `apiResponse()` and `requireRole()` helpers. Audit log on mutations

### Task 2.3 — CRUD API routes: position
- **Status**: NOT_STARTED
- **Dependencies**: 2.1
- **Files**: `src/app/api/positions/route.ts`, `[id]/route.ts`
- **Actions**: CRUD with hse_group_id linking. ADMIN/MANAGER access. Audit log

### Task 2.4 — HSE Group CRUD
- **Status**: NOT_STARTED
- **Dependencies**: 2.1
- **Files**: `src/app/api/hse-groups/route.ts`, `[id]/route.ts`, `src/lib/validations/hse-group.ts`

### Task 2.5 — CRUD API routes: user_profile
- **Status**: NOT_STARTED
- **Dependencies**: 2.2, 2.3
- **Files**: `src/app/api/users/route.ts`, `[id]/route.ts`, `[id]/roles/route.ts`
- **Actions**: GET (ADMIN all, MANAGER own employees), POST (temp password, password_changed_at=null), PUT, DELETE (soft: set end_date), role management sub-route. Audit log

### Task 2.6 — Password management (force change within 3 days)
- **Status**: NOT_STARTED
- **Dependencies**: 2.5
- **Files**: `src/app/api/users/[id]/reset-password/route.ts`
- **Actions**: Admin reset-password endpoint, middleware handles force redirect, 3-day expiry logic

### Task 2.7 — Profile page (all roles)
- **Status**: NOT_STARTED
- **Dependencies**: 2.5
- **Files**: `src/app/(user)/profile/page.tsx`, `src/components/profile/profile-form.tsx`, `src/app/api/profile/route.ts`, `src/app/api/upload/route.ts`
- **Actions**: Read-only display + editable: profile picture (file upload to `public/uploads/profiles/`), password change

### Task 2.8 — Admin/Manager UI pages for user management
- **Status**: NOT_STARTED
- **Dependencies**: 2.2–2.5
- **Files**: `src/app/(admin)/users/page.tsx`, `[id]/page.tsx`, `new/page.tsx`, `src/app/(admin)/positions/page.tsx`, `src/app/(admin)/organisational-units/page.tsx`, `src/app/(manager)/employees/page.tsx`, various form/table components
- **Actions**: Data tables (search, sort, pagination), create/edit forms, role assignment toggle, manager scoped view. Add shadcn: table, dialog, select, badge, toast

### Task 2.9 — Test lockout management UI
- **Status**: NOT_STARTED
- **Dependencies**: 2.8
- **Files**: `src/app/(admin)/lockout-management/page.tsx`, `src/app/(manager)/lockout-management/page.tsx`, `src/app/api/users/[id]/lockout/route.ts`
- **Actions**: Show users where hse_blocked=true (ADMIN all, MANAGER own employees), unlock button, audit log

### Task 2.10 — Audit log service
- **Status**: NOT_STARTED
- **Dependencies**: 2.2
- **Key file**: `src/lib/audit-log.ts`
- **Actions**: `createAuditLog(actorId, action, entityType, entityId)`. Integrate into all Phase 2 API routes

### Task 2.11 — Unit tests for Phase 2
- **Status**: NOT_STARTED
- **Dependencies**: 2.1–2.10
- **Files**: `src/__tests__/api/users.test.ts`, `positions.test.ts`, `organisational-units.test.ts`, `src/__tests__/lib/audit-log.test.ts`
- **Verify**: `npm test` passes

---

## PHASE 3 — Competency & Question Management (5 tasks)

**Goal**: Complete competency catalog and question bank.

### Task 3.1 — Competency hierarchy CRUD API routes
- **Status**: NOT_STARTED
- **Dependencies**: Phase 2
- **Files**: `src/app/api/competence-clusters/`, `competence-families/`, `competence-groups/`, `competences/` (route.ts + [id]/route.ts each), `src/lib/validations/competence.ts`
- **Actions**: Full CRUD for cluster → family → group → competence. Types: PROFESSIONAL/HSE. ADMIN/MANAGER access. Audit log

### Task 3.2 — Question bank CRUD API routes
- **Status**: NOT_STARTED
- **Dependencies**: 3.1
- **Files**: `src/app/api/questions/route.ts`, `[id]/route.ts`, `src/lib/validations/question.ts`
- **Actions**: CRUD linked to competence_id. Validate per type: SINGLE_CHOICE (1 correct), MULTIPLE_CHOICE (1+), ORDERING (ordered array), IMAGE_PLACEMENT (answer→coordinate map). Image upload. Duplicate warning

### Task 3.3 — Position-Competency mapping
- **Status**: NOT_STARTED
- **Dependencies**: 3.1
- **Files**: `src/app/api/positions/[id]/competences/route.ts`
- **Actions**: Link/unlink competences to positions (GET, POST, DELETE)

### Task 3.4 — Competency and Question management UI
- **Status**: NOT_STARTED
- **Dependencies**: 3.1–3.3
- **Files**: `src/app/(admin)/competencies/page.tsx`, `[id]/page.tsx`, `[id]/questions/page.tsx`, `src/app/(manager)/competencies/`, `src/components/competencies/competence-tree.tsx`, `competence-form.tsx`, `src/components/questions/question-form.tsx`, `question-list.tsx`
- **Actions**: Tree/accordion view (cluster>family>group>competence), inline CRUD, question type-specific form fields, image upload, position-competency mapping UI

### Task 3.5 — Unit tests for Phase 3
- **Status**: NOT_STARTED
- **Dependencies**: 3.1–3.4
- **Files**: `src/__tests__/api/competences.test.ts`, `questions.test.ts`, `src/__tests__/validations/question.test.ts`

---

## PHASE 4 — Test Template & Test Generation (6 tasks)

**Goal**: End-to-end test creation and assignment workflow.

### Task 4.1 — Test template CRUD API routes
- **Status**: NOT_STARTED
- **Dependencies**: Phase 3
- **Files**: `src/app/api/test-templates/route.ts`, `[id]/route.ts`, `[id]/competences/route.ts`, `src/lib/validations/test-template.ts`
- **Actions**: CRUD for test_template + test_template_competence (competences + question counts)

### Task 4.2 — Competency equality configuration
- **Status**: NOT_STARTED
- **Dependencies**: 4.1
- **Files**: `src/app/api/test-templates/[id]/equality/route.ts`, `src/lib/validations/competence-equality.ts`
- **Actions**: Per competence in template, define questions per difficulty level. Equal distribution flag or manual counts

### Task 4.3 — Test generation algorithm
- **Status**: NOT_STARTED
- **Dependencies**: 4.1, 4.2
- **Key file**: `src/lib/test-generation.ts`, `src/app/api/tests/generate/route.ts`
- **Actions**:
  - `generateTest(templateId, positionId, createdBy)`: read template, get level distribution, randomly select questions per competence+level, error if insufficient questions, create test + test_question records
  - `generateRetakeTest(parentTestId, failedCompetenceIds, userId)`: same algo but only failed competences, exclude parent test questions, set parent_test_id, increment iteration

### Task 4.4 — Test assignment API
- **Status**: NOT_STARTED
- **Dependencies**: 4.3
- **Files**: `src/app/api/tests/[id]/assign/route.ts`, `src/app/api/tests/[id]/route.ts`
- **Actions**: POST assign (user IDs → test_user_profile records), trigger notification stub. GET test details

### Task 4.5 — Manager test management UI
- **Status**: NOT_STARTED
- **Dependencies**: 4.1–4.4
- **Files**: `src/app/(manager)/tests/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `src/app/(admin)/tests/page.tsx`, components: template-form, test-assignment, test-status-table
- **Actions**: Template management, test generation (select template + position group), assignment (select employees), status table (PENDING/COMPLETED/FAILED per employee)

### Task 4.6 — Unit tests for Phase 4
- **Status**: NOT_STARTED
- **Dependencies**: 4.1–4.5
- **Files**: `src/__tests__/lib/test-generation.test.ts`, `src/__tests__/api/tests.test.ts`, `test-templates.test.ts`
- **Actions**: Test correct question count, level distribution, no duplicates, insufficient questions error, retake logic

---

## PHASE 5 — Test Taking Module (8 tasks)

**Goal**: Full test-taking experience with results and automatic retake.

### Task 5.1 — User pending tests dashboard
- **Status**: NOT_STARTED
- **Dependencies**: Phase 4
- **Files**: `src/app/(user)/tests/page.tsx`, `src/app/api/my-tests/route.ts`, `src/components/tests/pending-tests-list.tsx`
- **Actions**: API returns tests assigned to current user with status. Display: name, created date, question count, time limit, status. "Start Test" button

### Task 5.2 — Pre-test instructions screen
- **Status**: NOT_STARTED
- **Dependencies**: 5.1
- **Files**: `src/app/(user)/tests/[id]/page.tsx`, `src/components/test/test-instructions.tsx`
- **Actions**: Show test metadata + instructions. "Begin Test" button starts timer

### Task 5.3 — Test execution engine — single/multiple choice
- **Status**: NOT_STARTED
- **Dependencies**: 5.2
- **Files**: `src/app/(user)/tests/[id]/take/page.tsx`, `src/components/test/test-runner.tsx`, `question-display.tsx`, `single-choice-question.tsx`, `multiple-choice-question.tsx`, `countdown-timer.tsx`, `question-navigator.tsx`, `src/lib/test-state.ts`
- **Actions**: Load questions on start, one at a time, prev/next/jump navigation, countdown timer (auto-submit at 0), radio (single) / checkboxes (multiple), image alongside question, client state, "Submit Test" button

### Task 5.4 — Test execution — ordering and image placement
- **Status**: NOT_STARTED
- **Dependencies**: 5.3
- **Files**: `src/components/test/ordering-question.tsx`, `image-placement-question.tsx`
- **Actions**: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`. Drag-and-drop sortable (ordering), image drop zones (placement)

### Task 5.5 — Test submission and scoring logic
- **Status**: NOT_STARTED
- **Dependencies**: 5.3, 5.4
- **Key file**: `src/lib/scoring.ts`, `src/app/api/tests/[id]/submit/route.ts`
- **Actions**:
  - Scoring per type: SINGLE (1/0), MULTIPLE (all-or-nothing), ORDERING (full match), IMAGE_PLACEMENT (all correct)
  - Per-competence percentage, compare vs passing_indicator
  - Persist: test_result, test_answer, hse_requirement_rating, requirement_rating
  - Handle auto-submit on timeout (stopped=true)

### Task 5.6 — Post-test results screen
- **Status**: NOT_STARTED
- **Dependencies**: 5.5
- **Files**: `src/app/(user)/tests/[id]/results/page.tsx`, `src/components/test/test-results-summary.tsx`, `answer-review.tsx`
- **Actions**: Overall score bar, per-competence bars with pass/fail, answer review list, visual comparison for ordering/placement

### Task 5.7 — Auto-retake generation and test lockout
- **Status**: NOT_STARTED
- **Dependencies**: 5.5
- **Files**: Modify `src/app/api/tests/[id]/submit/route.ts`, reuse `src/lib/test-generation.ts`
- **Actions**: On failed competences → `generateRetakeTest()` + auto-assign + notify. Iteration > 2 → set hse_blocked=true, notify HSE manager, no more retakes. Blocked users see "locked" message

### Task 5.8 — Unit tests for Phase 5
- **Status**: NOT_STARTED
- **Dependencies**: 5.1–5.7
- **Files**: `src/__tests__/lib/scoring.test.ts`, `test-submit.test.ts`, `test-generation-retake.test.ts`, `src/__tests__/components/test-runner.test.tsx`

---

## PHASE 6 — Course Management & Assignment (5 tasks)

**Goal**: Course management with assignment and completion tracking.

### Task 6.1 — Course CRUD API routes
- **Status**: NOT_STARTED
- **Dependencies**: Phase 5
- **Files**: `src/app/api/courses/route.ts`, `[id]/route.ts`, `src/lib/validations/course.ts`

### Task 6.2 — Course assignment API
- **Status**: NOT_STARTED
- **Dependencies**: 6.1
- **Files**: `src/app/api/courses/[id]/assign/route.ts`, `src/app/api/my-courses/route.ts`, `src/app/api/my-courses/[id]/confirm/route.ts`
- **Actions**: Assign to users (linked to test), user views assigned courses, confirm completion

### Task 6.3 — Course management and user course UI
- **Status**: NOT_STARTED
- **Dependencies**: 6.1, 6.2
- **Files**: `src/app/(admin)/courses/`, `src/app/(manager)/courses/`, `src/app/(user)/courses/`, course form/list/assignment components

### Task 6.4 — 10-day notification trigger logic
- **Status**: NOT_STARTED
- **Dependencies**: 6.2
- **Key file**: `src/lib/course-notification.ts`
- **Actions**: Query unconfirmed courses where start_time + 10 days < now. Identify users + HSE managers. (Called by Phase 8 scheduled job)

### Task 6.5 — Unit tests for Phase 6
- **Status**: NOT_STARTED
- **Files**: `src/__tests__/api/courses.test.ts`, `src/__tests__/lib/course-notification.test.ts`

---

## PHASE 7 — Dashboards, Reporting & KPI (6 tasks)

**Goal**: Fully functional role-scoped dashboards with KPIs and charts.
**Note**: Can run in parallel with Phase 6 (both depend on Phase 5).

### Task 7.1 — KPI calculation service
- **Status**: NOT_STARTED
- **Dependencies**: Phase 5
- **Key file**: `src/lib/kpi.ts`, `src/app/api/dashboard/kpis/route.ts`
- **Actions**: 6 KPIs (all role-scoped): totalTestsAssigned, overallPassRate, bestCompetency, worstCompetency, lockedUsersCount, avgScoreByPosition

### Task 7.2 — Chart data API endpoints
- **Status**: NOT_STARTED
- **Dependencies**: 7.1
- **Files**: `src/app/api/dashboard/charts/test-results-over-time/route.ts`, `competency-scores/route.ts`, `pass-fail-distribution/route.ts`, `score-by-position/route.ts`
- **Actions**: Each accepts filter params (managerId, userId, departmentId, testId, dateFrom, dateTo). Role-scoped

### Task 7.3 — Dashboard chart components
- **Status**: NOT_STARTED
- **Dependencies**: 7.2
- **Files**: `src/components/charts/line-chart.tsx`, `bar-chart.tsx`, `pie-chart.tsx`, `grouped-bar-chart.tsx`, `chart-wrapper.tsx`, `kpi-card.tsx`
- **Actions**: `npm install recharts`. Fullscreen toggle, hover detail card/tooltip, KPI card component

### Task 7.4 — Dashboard pages per role
- **Status**: NOT_STARTED
- **Dependencies**: 7.1–7.3
- **Files**: Replace placeholder dashboards in `src/app/(admin)/dashboard/`, `(manager)/dashboard/`, `(user)/dashboard/`, `src/components/dashboard/dashboard-filters.tsx`
- **Actions**: Admin: all KPIs + charts + filters. Manager: scoped to own employees. User: own data only

### Task 7.5 — Automatic report generation
- **Status**: NOT_STARTED
- **Dependencies**: 7.2
- **Files**: `src/app/api/reports/hse/route.ts`, `technical/route.ts`, `src/components/reports/report-view.tsx`, `src/app/(admin)/reports/page.tsx`, `(manager)/reports/`
- **Actions**: HSE and Technical reports as printable HTML (CSS @media print → PDF via browser). Filters: date range, department, position

### Task 7.6 — Unit tests for Phase 7
- **Status**: NOT_STARTED
- **Files**: `src/__tests__/lib/kpi.test.ts`, `src/__tests__/api/dashboard.test.ts`

---

## PHASE 8 — Notifications & Alerts Engine (6 tasks)

**Goal**: Fully operational notification engine.

### Task 8.1 — Notification CRUD and API
- **Status**: NOT_STARTED
- **Files**: `src/app/api/notifications/route.ts`, `[id]/route.ts`, `mark-all-read/route.ts`
- **Actions**: GET (current user, ordered by date, filter by status), PUT mark as READ, bulk mark all

### Task 8.2 — Email service via SMTP
- **Status**: NOT_STARTED
- **Key file**: `src/lib/email.ts`, `src/lib/email-templates.ts`
- **Actions**: `npm install nodemailer @types/nodemailer`. sendEmail(to, subject, html). Templates: test assigned, test locked, course not reviewed, password reset. Graceful failure on SMTP unavailability

### Task 8.3 — Notification service (unified trigger)
- **Status**: NOT_STARTED
- **Dependencies**: 8.1, 8.2
- **Key file**: `src/lib/notifications.ts`
- **Actions**: Unified `notify(type, recipientId, data)`: creates in-app notification + sends email. Events: TEST_ASSIGNED, TEST_LOCKED, COURSE_NOT_REVIEWED, PENDING_REMINDER. Integrate into Tasks 4.4, 5.7, 6.4

### Task 8.4 — Notification UI (bell icon, dropdown, page)
- **Status**: NOT_STARTED
- **Dependencies**: 8.1
- **Files**: `src/components/navigation/notification-bell.tsx`, notification pages per role
- **Actions**: Bell icon in header with unread badge, dropdown (latest 5), full page with pagination, click → mark read + navigate

### Task 8.5 — Scheduled job for 10-day course check
- **Status**: NOT_STARTED
- **Dependencies**: 8.3, 6.4
- **Files**: `src/app/api/cron/course-review-check/route.ts`
- **Actions**: Runs 10-day check logic, calls notify for each overdue, idempotent (no duplicate notifications), secured with secret header

### Task 8.6 — Unit tests for Phase 8
- **Status**: NOT_STARTED
- **Files**: `src/__tests__/lib/notifications.test.ts`, `email.test.ts`, `src/__tests__/api/cron.test.ts`

---

## PHASE 9 — Security Hardening & Final Testing (8 tasks)

**Goal**: Production-ready, security-hardened application.

### Task 9.1 — Audit log viewer (ADMIN only)
- **Status**: NOT_STARTED
- **Files**: `src/app/(admin)/audit-log/page.tsx`, `src/app/api/audit-log/route.ts`, `src/components/audit-log/audit-log-table.tsx`
- **Actions**: Paginated table with filters (actor, action type, entity type, date range). ADMIN only

### Task 9.2 — Rate limiting on auth endpoints
- **Status**: NOT_STARTED
- **Key file**: `src/lib/rate-limit.ts`
- **Actions**: In-memory rate limiter (no Redis needed on-prem). Apply to `/api/auth/callback/credentials` and `/api/auth/change-password`. Return 429 when exceeded

### Task 9.3 — Account lockout with auto-unlock
- **Status**: NOT_STARTED
- **Files**: Modify `src/lib/auth.ts`, `src/lib/auth-utils.ts`
- **Actions**: Increment failed_login_attempts on failure. Lock after N failures (set locked_until). Auto-unlock when locked_until expires. Reset on successful login

### Task 9.4 — Security headers review and finalization
- **Status**: NOT_STARTED
- **Files**: `next.config.ts`
- **Actions**: Tighten CSP, verify all headers, test CSP doesn't break shadcn (may need unsafe-inline for styles)

### Task 9.5 — Security documentation
- **Status**: NOT_STARTED
- **Files**: `docs/security.md`
- **Actions**: Document all mechanisms by category: Critical (password policy, RBAC, HTTPS, Prisma SQL injection prevention, CSRF, Zod validation), Nice to Have (rate limiting, security headers, audit log, session expiry), Not Required (OAuth, 2FA)

### Task 9.6 — Full unit test coverage review
- **Status**: NOT_STARTED
- **Actions**: `npm run test:coverage`. Fill gaps in error paths (400/401/403/404/500), scoring edge cases, role enforcement

### Task 9.7 — Integration tests for critical user journeys
- **Status**: NOT_STARTED
- **Files**: `src/__tests__/integration/login-flow.test.ts`, `test-taking-flow.test.ts`, `dashboard-flow.test.ts`
- **Actions**: Login → force password change → dashboard. Create template → generate → assign → take → results → retake. Dashboard KPIs correct

### Task 9.8 — Manual QA pass
- **Status**: NOT_STARTED
- **Actions**: All 3 roles end-to-end. All CRUD. Edge cases (expired password, locked account, blocked user). Cross-browser (Chrome, Firefox, Edge)

---

## Dependency Graph

```
Phase 1 (1.1–1.14) — foundation, login, routing
  │
Phase 2 (2.1–2.11) — users, positions, org units
  │
Phase 3 (3.1–3.5) — competencies, questions
  │
Phase 4 (4.1–4.6) — test templates, generation, assignment
  │
Phase 5 (5.1–5.8) — test taking, scoring, retake
  │               \
Phase 6 (6.1–6.5)  Phase 7 (7.1–7.6)   ← can run in parallel
  │               /
Phase 8 (8.1–8.6) — notifications, email
  │
Phase 9 (9.1–9.8) — security, final testing
```

---

## Total: 69 tasks across 9 phases

## Verification

After each phase:
1. Run `npm run dev` — app should start without errors
2. Run `npm test` — all tests pass
3. Run `npm run build` — build succeeds
4. Manual smoke test of new features through the UI
