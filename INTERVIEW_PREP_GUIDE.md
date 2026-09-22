# College Voting System — Comprehensive Interview Preparation Guide

This guide is designed to help you confidently explain your **College Voting System** project in technical and behavioral interviews. It contains elevator pitches, system architecture explanations, database design highlights, security paradigms, and detailed answers to technical questions that interviewers frequently ask.

---

## Table of Contents
1. [Project Snapshot & Tech Stack](#1-project-snapshot--tech-stack)
2. [How to Explain Your Project to an Interviewer](#2-how-to-explain-your-project-to-an-interviewer)
   - [30-Second Elevator Pitch](#30-second-elevator-pitch)
   - [2-Minute Structured Pitch (STAR Method)](#2-minute-structured-pitch-star-method)
   - [5-Minute Deep-Dive Technical Walkthrough](#5-minute-deep-dive-technical-walkthrough)
3. [System Architecture & Database Design](#3-system-architecture--database-design)
4. [Key Engineering Highlights & Differentiators](#4-key-engineering-highlights--differentiators)
5. [Top Interview Questions & Impressive Answers](#5-top-interview-questions--impressive-answers)
   - [Category 1: System Design & Architecture](#category-1-system-design--architecture)
   - [Category 2: Database & Concurrency (ACID Transactions)](#category-2-database--concurrency-acid-transactions)
   - [Category 3: Security, Authentication & RBAC](#category-3-security-authentication--rbac)
   - [Category 4: Frontend Architecture & State Management](#category-4-frontend-architecture--state-management)
   - [Category 5: Edge Cases, Failure Handling & Reliability](#category-5-edge-cases-failure-handling--reliability)
   - [Category 6: Behavioral & Problem-Solving (STAR)](#category-6-behavioral--problem-solving-star)
6. [Future Enhancements & Scalability Roadmap](#6-future-enhancements--scalability-roadmap)
7. [Interview Day Quick-Reference Cheat Sheet](#7-interview-day-quick-reference-cheat-sheet)

---

## 1. Project Snapshot & Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express.js (v5), RESTful API Architecture |
| **Database** | MySQL 8 with connection pooling (`mysql2/promise`) |
| **Authentication & Security** | JSON Web Tokens (JWT), `bcryptjs` password hashing, Role-Based Access Control (RBAC) middleware |
| **Email & Communication** | Brevo (formerly Sendinblue) Transactional API for OTP verification and automated onboarding |
| **Development & Tooling** | Nodemon, Git/GitHub, Oxlint |

---

## 2. How to Explain Your Project to an Interviewer

### 30-Second Elevator Pitch
> *"I designed and built a full-stack **College Voting System** that replaces manual paper-based ballots with an auditable, role-based digital election platform. Built with **React 19, Node.js/Express, and MySQL**, the system features strict multi-tier RBAC for Super Admins, Department Admins, and Students. Its core engineering highlight is an **atomic transaction engine** that guarantees double-voting prevention through database constraints, accompanied by **Brevo-powered OTP verification** for secure authentication and dynamic voter eligibility filtering."*

---

### 2-Minute Structured Pitch (STAR Method)

- **Situation:** Traditional college student elections rely on paper ballots or ad-hoc Google Forms. These approaches suffer from vote tampering, slow manual tallying (often taking hours or days), zero ballot secrecy validation, and human errors in checking eligibility across departments, years, and sections.
- **Task:** My objective was to engineer an end-to-end digital election management platform that delivers absolute ballot integrity, prevents double voting even under high concurrency, enforces strict departmental isolation, and computes real-time verified election results.
- **Action:**
  1. **Designed a Normalized Relational Schema:** Built a normalized MySQL schema modeling academic hierarchies (Department $\rightarrow$ Academic Year $\rightarrow$ Section), multi-position elections, candidate nominations, and an `eligible_voters` mapping table.
  2. **Engineered an Atomic Voting Pipeline:** Used MySQL transactions (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) combined with compound unique constraints (`UNIQUE(election_id, position_id, student_id)`) to make ballot submission atomic across multiple positions and immune to race conditions.
  3. **Implemented 3-Tier RBAC:** Created modular middleware ensuring Super Admins oversee college-wide parameters, Department Admins manage only their students/elections, and Students can only vote once within their registered eligibility pool.
  4. **Integrated Secure Onboarding:** Developed automated temporary credential distribution and 5-minute expiring OTP verification using Brevo Transactional Email API with a forced first-login password change flow.
  5. **Built an Intuitive Frontend:** Designed a responsive single-page application using React 19, React Router v7, and Tailwind CSS with real-time client-side validation, live turn-out statistics, and visual result charts.
- **Result:** The system completely eliminates manual counting errors, enforces cryptographic and database guarantees against double-voting, cuts election result tabulation time from days to milliseconds upon election closure, and maintains audit readiness with structured logs.

---

### 5-Minute Deep-Dive Technical Walkthrough

When an interviewer asks: *"Walk me through the architecture and how data flows through the application."*

1. **User Authentication & Session Management:**
   - Users can authenticate using either their email address or college Student ID.
   - Passwords are encrypted using `bcryptjs` with salt rounds.
   - Upon first login, if `must_change_password` is flagged `true`, token generation is withheld and the client is routed to a mandatory password change screen.
   - Authenticated sessions issue signed JWTs containing `userId`, `email`, and `role`. Requests pass through `authenticateToken` middleware and `authorizeRoles("SUPER_ADMIN", "ADMIN", "STUDENT")`.

2. **Departmental Scoping & Admin Boundaries:**
   - A Super Admin creates departments, academic years, sections, and assigns Department Admins.
   - When a Department Admin logs in, SQL queries automatically scope data to their `department_id`. An admin from the CSE department cannot view, modify, or create elections for ECE or Mechanical students.

3. **Election Lifecycle State Machine:**
   - Elections transition through clear states: `DRAFT` $\rightarrow$ `UPCOMING` $\rightarrow$ `ACTIVE` $\rightarrow$ `CLOSED` $\rightarrow$ `RESULT_PUBLISHED`.
   - Voting endpoints only accept ballots when the election status is explicitly `ACTIVE`.
   - Results are hidden from students until an authorized admin reviews and transitions the election status to `RESULT_PUBLISHED`.

4. **The Voting Transaction Lifecycle:**
   - A student selects candidates across multiple positions (e.g., President, General Secretary).
   - The payload sends `election_id` and an array of `{ position_id, candidate_id }`.
   - A dedicated database connection is pulled from the pool and begins a transaction.
   - The backend validates:
     1. Student account is `ACTIVE`.
     2. Election is `ACTIVE`.
     3. Student exists in `eligible_voters` for that election.
     4. Position belongs to that election and candidate belongs to that position.
     5. The student has not already voted for that position (checked via SQL and enforced via compound unique key).
   - If any step fails, the entire transaction rolls back cleanly. If all succeed, the transaction commits, recording the vote timestamp and student participation.

---

## 3. System Architecture & Database Design

### High-Level Architecture Diagram
```
  [ React 19 Single Page App ]
               │
          REST APIs (JSON / JWT)
               ▼
  [ Express.js / Node.js API Gateway ]
   ├── Authentication Middleware (JWT verify)
   ├── Role-Based Access Control (RBAC)
   ├── Input Sanitization & Payload Validator
   └── Transaction Controller (voteController.js)
         │                     │
         ▼                     ▼
   [ MySQL 8 Database ]    [ Brevo Transactional Email API ]
   ├── Academic Hierarchy        ├── Account Creation Credentials
   ├── Users & Admins            └── 5-minute Expiring OTPs
   ├── Elections & Candidates
   └── Atomic Votes Table
```

### Relational Schema Design Highlights
- **`users`**: Base credentials table (`id`, `email`, `password_hash`, `role`, `status`, `must_change_password`).
- **`departments`**, **`years`**, **`sections`**: Cascading hierarchy modeling college academic structures.
- **`students`**: Tied 1-to-1 with `users`, linked with Foreign Keys to department, year, and section.
- **`elections`**: Holds title, description, time window (`start_date`, `end_date`), and state machine `status`.
- **`positions`**: Specific contested roles per election (`UNIQUE(election_id, name)`).
- **`candidates`**: Nominated students linked to positions (`UNIQUE(election_id, position_id, student_id)`).
- **`eligible_voters`**: Pre-calculated eligibility mapping list (`UNIQUE(election_id, student_id)`).
- **`votes`**: The core ballot box table (`election_id`, `position_id`, `candidate_id`, `student_id`, `voted_at`).
  - **Critical Constraint**: `UNIQUE KEY (election_id, position_id, student_id)` physically prevents double-voting at the database storage engine layer.

---

## 4. Key Engineering Highlights & Differentiators

When talking to interviewers, highlight these engineering practices to stand out from typical student projects:

1. **Defense-in-Depth against Double Voting:**
   - *Application Level:* Validates payload for duplicate position IDs within the same request using a `Set`. Checks prior vote history using `hasVoted()`.
   - *Database Level:* Hard compound unique index `UNIQUE(election_id, position_id, student_id)`. Even under concurrent race conditions (e.g., student double-clicks or runs automated scripts), MySQL rejects the second query with error code `1062 (ER_DUP_ENTRY)`.
2. **ACID Transactions:**
   - Voting across multiple positions in a single election is treated as a single atomic unit of work. If a ballot has 3 positions and the 3rd fails, the entire vote is rolled back. No partial or corrupted ballots exist.
3. **Strict RBAC & Departmental Isolation:**
   - Multi-tenant architecture design where Department Admins are bound to their assigned department ID via database joins, preventing horizontal privilege escalation.
4. **Resilient Production Email Integration:**
   - Transactional emails are dispatched using Brevo's official SDK with dynamic HTML templates, separating email configuration and credentials in secure environment variables.
5. **Modern Frontend Standards:**
   - Built on React 19 and Vite with zero legacy boilerplate.
   - Centralized authentication context (`AuthContext`) handling token storage, persistent auth state, role redirection, and logout synchronization.

---

## 5. Top Interview Questions & Impressive Answers

### Category 1: System Design & Architecture

#### Q1: "Why did you choose a relational database (MySQL) instead of NoSQL (like MongoDB) for a voting system?"
**Answer:**
> *"A voting system requires strict ACID compliance, data integrity, and complex relational constraints. 
> 1. **Data Consistency & Double-Voting Prevention:** In a voting platform, consistency is non-negotiable. Relational compound unique keys (such as `UNIQUE(election_id, position_id, student_id)`) enforce at the storage engine level that a student cannot vote twice. In document stores like MongoDB, ensuring this across related collections requires either distributed transactions or complex indexing strategies.
> 2. **Relational Model Fit:** Our domain has clear relational entities: a Department has Years, which have Sections, which contain Students. Elections contain Positions, and Positions contain nominated Candidates. These 1-to-many and many-to-many relationships naturally normalize in MySQL without data duplication.
> 3. **ACID Transactions:** Casting votes across multiple positions requires an atomic unit of work where all votes succeed or none do. MySQL's InnoDB engine provides robust row-level locking and transaction rollback capabilities ideal for this workload."*

---

#### Q2: "How do you handle ballot secrecy while also preventing fraud and auditing results?"
**Answer:**
> *"This is a classic trade-off in electronic voting: **Voter Anonymity vs. Fraud Prevention**.
> In our college voting architecture:
> - **Eligibility & Anti-Duplicate Check:** We record that a student has voted in an election so they cannot vote again.
> - **Separation of Concerns:** When querying public election results, the SQL aggregation queries `COUNT(v.id)` grouped strictly by `candidate_id` and `position_id`. The results API returns candidate vote totals and turn-out percentages without exposing voter identity.
> - **Future Cryptographic Extension:** If complete zero-knowledge ballot secrecy is required, we can separate the table into two parts: an `election_participation` table (storing `student_id` + `election_id` as proof of participation) and an anonymized `ballot_box` table (storing only `position_id` + `candidate_id` with a cryptographic blind signature or hash), decoupling the voter's identity from their cast ballot."*

---

#### Q3: "Walk me through the election status lifecycle. Why is it needed?"
**Answer:**
> *"We implemented a 5-stage state machine:
> 1. `DRAFT`: Admin creates and configures the election, defines positions, and nominates candidates without exposing it to students.
> 2. `UPCOMING`: Election details are visible on student dashboards for awareness and manifesto review, but the vote button is disabled.
> 3. `ACTIVE`: Voting is open. Only in this state does the `submitVotes` API accept incoming ballot submissions.
> 4. `CLOSED`: The voting window has ended. No new votes can be submitted. Admins can view preliminary tallies.
> 5. `RESULT_PUBLISHED`: Results are made public to students.
> This state machine prevents students from submitting votes before or after election windows, and prevents premature election result leaks that could bias ongoing voter turnout."*

---

### Category 2: Database & Concurrency (ACID Transactions)

#### Q4: "What happens if two voting requests from the same student hit the server at the exact same millisecond?"
**Answer:**
> *"This is a classic concurrency race condition. If we only checked `hasVoted()` via a `SELECT` query in JavaScript, both requests might see zero votes cast and proceed to insert.
> We solved this with a two-layer defense:
> 1. **Database Constraint:** The `votes` table has a compound unique key: `UNIQUE (election_id, position_id, student_id)`.
> 2. **InnoDB Row Locking & Error Handling:** When both requests execute the `INSERT` statement within their respective transactions, MySQL allows the first transaction to acquire the unique index lock. The second transaction is rejected with error code `ER_DUP_ENTRY` (MySQL Error 1062).
> In our controller's `catch` block, we explicitly check for `error.code === 'ER_DUP_ENTRY' || error.errno === 1062`, roll back the transaction, and respond with an informative HTTP `409 Conflict` status code: 'A duplicate vote was detected.' The database remains 100% consistent."*

---

#### Q5: "Why did you use an explicit database transaction in `submitVotes`?"
**Answer:**
> *"In a student election, a student typically casts votes for multiple positions at once (e.g., President, Vice President, Secretary).
> If a ballot contains 3 positions, and the server inserts the vote for Position 1 and Position 2, but fails on Position 3 (due to a database constraint violation, server interruption, or invalid candidate ID), without a transaction the student would be left in a corrupted state: partially voted, unable to vote again, and missing their 3rd selection.
> By wrapping the loop in:
> ```javascript
> connection = await pool.getConnection();
> await connection.beginTransaction();
> // validate and insert all positions
> await connection.commit();
> ```
> We ensure **Atomicity**. Either all selected positions are recorded, or if any check fails, `connection.rollback()` is triggered in the `catch` block, leaving no orphan records."*

---

### Category 3: Security, Authentication & RBAC

#### Q6: "How does your Role-Based Access Control (RBAC) work across backend and frontend?"
**Answer:**
> *"RBAC is enforced on both layers with the backend serving as the absolute source of truth:
> - **Backend Layer:**
>   1. `authenticateToken` middleware verifies the JWT signature and extracts `req.user`.
>   2. `authorizeRoles(...roles)` higher-order middleware checks whether `req.user.role` matches allowed roles (e.g., `SUPER_ADMIN`, `ADMIN`, `STUDENT`). If unauthorized, it returns an immediate HTTP `403 Forbidden`.
>   3. Departmental scoping queries ensure a CSE Admin cannot query or modify ECE department records by injecting the authenticated admin's `department_id` into SQL filters.
> - **Frontend Layer:**
>   1. React Router routes are wrapped in a `<ProtectedRoute allowedRoles={['...']}>` component.
>   2. If an unauthenticated user visits a route, they are redirected to `/login`.
>   3. If an authenticated student tries to type `/admin` or `/superadmin` in the browser URL bar, the `ProtectedRoute` intercepts them and renders an unauthorized 403 page with an automatic redirect back to `/student`."*

---

#### Q7: "How is user password security handled, especially during account creation?"
**Answer:**
> *"We follow strict password security standards:
> 1. **Hashing:** Passwords are never stored in plain text. We hash them using `bcryptjs` with standard salt rounds.
> 2. **Automated Onboarding & Temporary Passwords:** When an admin adds a new student or department admin, the backend generates a cryptographically secure random password, hashes it, stores it, and sends it to the user's registered email via Brevo API.
> 3. **Forced First-Time Password Change:** The user record is created with `must_change_password = TRUE`. When the user logs in for the first time, the login endpoint verifies the credentials, but explicitly suppresses token generation and returns `{ requiresPasswordChange: true }`. The user is forced to choose a new password before they are granted access to any voting or administrative functions."*

---

#### Q8: "How does your OTP system work, and how do you protect against brute-force attacks?"
**Answer:**
> *"For password resets, we generate a cryptographically random 6-digit numeric code stored in the `otp_verifications` table along with `user_id`, `purpose`, and `expires_at` (set to 5 minutes).
> - The code is emailed via Brevo transactional email.
> - When submitted, we query for matching `user_id`, `otp_code`, `verified = FALSE`, and `expires_at > NOW()`.
> - Once verified, the record is immediately flagged `verified = TRUE` to prevent replay attacks.
> - To mitigate brute force attempts, we enforce short expiration windows (5 minutes), single-use flags, and in production, route-level rate limiting (e.g., `express-rate-limit`) restricting verification attempts to a maximum of 5 tries per IP/email."*

---

### Category 4: Frontend Architecture & State Management

#### Q9: "Why React 19 and how do you handle state across the app?"
**Answer:**
> *"We chose React 19 with Vite for ultra-fast HMR and modular component rendering.
> - **Global Auth State:** We implemented an `AuthContext` provider that manages `user`, `token`, `isAuthenticated`, and `role`. It hydrates from `localStorage` on initial mount, ensuring seamless session persistence across page refreshes.
> - **API Service Abstraction:** We created an Axios API client (`services/api.js`) equipped with request interceptors that automatically attach the `Authorization: Bearer <token>` header to all outgoing requests.
> - **Clean UI / UX:** We designed dedicated layouts for each persona (`SuperAdminLayout`, `AdminLayout`, `AuthLayout`) with responsive sidebar navigation, toast notifications (`react-hot-toast`), and reusable components (`StatCard`, `EmptyState`, `Modal`, `Alert`)."*

---

#### Q10: "How did you design the ballot submission UI to prevent student voting mistakes?"
**Answer:**
> *"Casting a vote is irreversible, so the UI provides clear confirmation safeguards:
> 1. **Candidate Card Selection:** Candidates display clear photos, names, and manifestos. Selecting a candidate highlights their card and updates local state.
> 2. **Review / Confirmation Step (`ConfirmVote.jsx`):** Before making the final API call, students are navigated to a dedicated ballot review screen that lists each position and their selected candidate side-by-side.
> 3. **Explicit Modal Confirmation:** Clicking 'Submit Ballot' prompts an interactive confirmation modal warning that once cast, votes cannot be retracted or altered.
> 4. **Instant State Transition:** Once submitted successfully, the election card on their dashboard immediately flips its status badge to 'Voted' with the timestamp, preventing redundant clicks."*

---

### Category 5: Edge Cases, Failure Handling & Reliability

#### Q11: "What happens if the Brevo Email API goes down or fails?"
**Answer:**
> *"External third-party APIs can experience downtime or rate limits. In our architecture:
> - In `emailService.js`, calls to `brevo.transactionalEmails.sendTransacEmail()` are wrapped in `try/catch` blocks.
> - For critical credentials, we have a backup logging utility (`credentialLogger.js`) that safely logs account generation events locally in development/audit mode (`credentials.txt` which is strictly gitignored).
> - In an enterprise production deployment, we would decouple email delivery using an asynchronous message queue (such as Redis with BullMQ). The controller would write a job to the queue and immediately respond to the user. A worker process would retry failed deliveries with exponential backoff without blocking HTTP request threads."*

---

#### Q12: "How do you ensure election results are computed accurately without performance bottlenecks?"
**Answer:**
> *"Election results are calculated using an optimized SQL aggregation query:
> ```sql
> SELECT 
>     p.id AS position_id,
>     p.name AS position_name,
>     c.id AS candidate_id,
>     s.full_name AS candidate_name,
>     COUNT(v.id) AS vote_count
> FROM positions p
> JOIN candidates c ON p.id = c.position_id
> JOIN students s ON c.student_id = s.id
> LEFT JOIN votes v ON v.candidate_id = c.id AND v.position_id = p.id
> WHERE p.election_id = ?
> GROUP BY p.id, c.id
> ORDER BY p.id ASC, vote_count DESC;
> ```
> - By leveraging indexes on `votes(election_id, position_id, candidate_id)`, the aggregation completes in milliseconds even with thousands of votes.
> - For elections with large student bodies, results can be cached or written to a summary table upon transitioning the election to `CLOSED`, avoiding repeated aggregation on every view."*

---

### Category 6: Behavioral & Problem-Solving (STAR)

#### Q13: "What was the most challenging technical challenge or bug you faced in this project, and how did you resolve it?"
**Answer (Template):**
> *"**Situation:** When testing concurrent voting simulations, we discovered that if a student rapidly clicked the submit button or sent two simultaneous HTTP requests, both requests occasionally slipped past the initial JavaScript verification check, leading to inconsistent vote counts.
> **Task:** I needed to ensure that no matter what happened on the network or client layer, double-voting was mathematically and physically impossible.
> **Action:** First, on the frontend, I introduced button debounce and loading state locks that immediately disable the submit button upon the first click. Second and most importantly, on the database layer, I analyzed our index strategy and added a compound unique key `UNIQUE KEY (election_id, position_id, student_id)` on the `votes` table. Then, I restructured `submitVotes` into an atomic MySQL transaction with dedicated error catching for MySQL error code `1062 (ER_DUP_ENTRY)`.
> **Result:** Even when we bombarded the endpoint with concurrent parallel requests via test scripts, only the first request succeeded with `201 Created` and all subsequent requests were cleanly rejected with `409 Conflict`. The vote tallies remained 100% accurate."*

---

#### Q14: "If you had another month to work on this project, what would you improve?"
**Answer:**
> *"I have three clear items on the roadmap:
> 1. **Zero-Knowledge Cryptographic Auditing:** Implement cryptographic ballot receipt hashing (e.g., SHA-256 ballot receipts) so a student can independently verify that their vote was counted in the final tally without revealing which candidate they voted for.
> 2. **Real-Time Live Turnout with WebSockets:** Integrate Socket.io so admins can monitor real-time department voter turnout percentages on a live dashboard without polling the database.
> 3. **Automated Dockerization & CI/CD:** Containerize the backend, frontend, and MySQL database using Docker Compose, and set up GitHub Actions for automated linting, unit testing, and deployment to a cloud provider like AWS ECS or Render."*

---

## 6. Future Enhancements & Scalability Roadmap

1. **Facial or Biometric Voter Authentication:** Incorporate web-cam based identity verification before unlocking the ballot.
2. **Bulk CSV Student Import:** Allow Department Admins to upload a CSV file with hundreds of student records for batch onboarding and automatic credential dispatch.
3. **Multi-Tenant College Support:** Support multiple colleges or campuses within the same deployment using a tenant identifier (`college_id`).
4. **Blockchain / Verifiable Ledger Integration:** Write closed election results to an immutable public or private ledger for transparent verification.

---

## 7. Interview Day Quick-Reference Cheat Sheet

### Golden Metrics & Architectural Keywords
- **ACID Transactions:** Explain that casting votes across multiple positions is an *atomic* transaction.
- **Compound Unique Constraints:** `UNIQUE (election_id, position_id, student_id)` — your primary defense against double voting.
- **3-Tier RBAC:** `SUPER_ADMIN` (college-wide), `ADMIN` (department-scoped), `STUDENT` (voter).
- **Password Hygiene:** `bcryptjs` salt rounds + forced password reset on first login (`must_change_password`).
- **OTP Protocol:** 6-digit numeric OTP, 5-minute expiry, single-use invalidation (`verified = TRUE`).
- **RESTful State Machine:** Elections transition strictly across `DRAFT` $\rightarrow$ `UPCOMING` $\rightarrow$ `ACTIVE` $\rightarrow$ `CLOSED` $\rightarrow$ `RESULT_PUBLISHED`.

### What NOT to Say vs. What to Say
| ❌ Avoid Saying |  Say Instead |
| :--- | :--- |
| *"I just used MySQL because I know SQL."* | *"I chose MySQL because election systems require ACID transactions, strict relational normalization, and database-level unique constraints to guarantee zero double-voting."* |
| *"I didn't think about security much."* | *"Security is built in at multiple levels: password hashing with bcrypt, JWT token verification with RBAC middleware, input sanitization, and departmental data isolation."* |
| *"Votes are just inserted into a table."* | *"Votes are processed within an atomic MySQL transaction that validates voter eligibility, checks election status, prevents duplicate position submissions, and rolls back cleanly on any failure."* |
| *"The frontend just displays data."* | *"The frontend is a modular React 19 SPA with protected route guards, centralized auth state hydration, responsive Tailwind styling, and explicit multi-step ballot confirmation flows."* |
