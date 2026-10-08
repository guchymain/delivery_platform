# SwiftShip — Delivery System Platform

A production-grade, full-stack logistics and courier platform connecting Customers, Riders, and Operations Administrators across Nigeria and worldwide. Built with a high-performance **Express 5** REST API powered by **PostgreSQL on Aiven Cloud** and **Sequelize ORM**, paired with a modern, responsive **React 19 / Vite / Tailwind CSS** single-page application.

---

## Table of Contents

- [Platform Overview](#platform-overview)
- [Key Actors & Capabilities](#key-actors--capabilities)
- [Tech Stack](#tech-stack)
- [Cloud Database & Data Architecture](#cloud-database--data-architecture)
- [Business Logic Beyond CRUD](#business-logic-beyond-crud)
  - [1. Role-Based Access Control (RBAC)](#1-role-based-access-control-rbac)
  - [2. Resource Ownership & Multi-Tenancy Protection](#2-resource-ownership--multi-tenancy-protection)
  - [3. Courier Rider Assignment & Dispatch](#3-courier-rider-assignment--dispatch)
  - [4. Rider Availability State Machine](#4-rider-availability-state-machine)
  - [5. Delivery Lifecycle Progression](#5-delivery-lifecycle-progression)
  - [6. Payment State & Ledger Synchronization](#6-payment-state--ledger-synchronization)
  - [7. Order Cancellation Protection](#7-order-cancellation-protection)
  - [8. Completed Delivery Immutability](#8-completed-delivery-immutability)
  - [9. User Suspension & Governance Guards](#9-user-suspension--governance-guards)
  - [10. Data Privacy & Contact Masking](#10-data-privacy--contact-masking)
- [Frontend Architecture & UI Polish](#frontend-architecture--ui-polish)
- [System Architecture & Database Schema](#system-architecture--database-schema)
- [Complete REST API Reference](#complete-rest-api-reference)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started & Running Locally](#getting-started--running-locally)
- [Testing & Quality Verification](#testing--quality-verification)
- [Demo Credentials](#demo-credentials)

---

## Platform Overview

SwiftShip provides an enterprise logistics network headquartered in Nigeria, enabling:
- **Intra-City & Nationwide Delivery**: Doorstep pickup and fast transit connecting Lagos, Abuja, Port Harcourt, Kano, Ibadan, Enugu, and all 36 states.
- **Global Air Freight & Courier Export**: Scheduled express dispatches to the United Kingdom, United States, Canada, Europe, UAE, and over 200 international destinations.
- **Transparent Dynamic Pricing**: Real-time delivery fee calculation engine ($5.00 base up to 1kg + $1.50/kg for incremental weight) with live Naira conversions.
- **Auditable Lifecycle Tracking**: Public and authenticated milestone progression steppers with contact privacy safeguards.

---

## Key Actors & Capabilities

### 1. Customer
- Request on-demand doorstep parcel collection with customizable recipient coordinates and parcel descriptions.
- Instant delivery fee estimation with dynamic mode switching (Domestic Nigeria, International Express, Shop & Ship).
- Flexible payment methods: **Debit/Credit Card**, **Bank Transfer**, or **Cash on Delivery (COD)**.
- Real-time tracking portal with live status progression steppers.
- Order history management and self-service cancellation (while unassigned).

### 2. Courier Rider
- Dedicated mobile-optimized dispatch cockpit with instant availability toggling (`AVAILABLE` $\leftrightarrow$ `OFFLINE`).
- Browse and claim unassigned orders from the open jobs board.
- Checkpoint transition actions (`PICKED_UP` $\to$ `IN_TRANSIT` $\to$ `DELIVERED`).
- Complete runs archive, performance rating metrics, and gross earnings breakdown.

### 3. Operations Administrator
- Centralized fleet and dispatch oversight console.
- Real-time KPI dashboard (total deliveries, on-time completion rates, fleet distribution, active volumes).
- Manual courier dispatch and priority job re-assignment.
- Financial ledger monitoring, transaction reference audits, and payment refund controls.
- User account status governance (`ACTIVE`, `INACTIVE`, `SUSPENDED`).

---

## Tech Stack

### Backend
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js 5
- **Cloud Database:** PostgreSQL (Hosted on Aiven Cloud with SSL/TLS requirement)
- **ORM:** Sequelize 6 & Sequelize CLI (Migrations, Seeders, Model Associations)
- **Validation:** Zod 4 (Strict schema enforcement on request body, params, and queries)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcrypt` (10 rounds password hashing)
- **Security:** `cors`, `express-rate-limit`, `dotenv` (Fail-fast initialization, zero secret defaults)

### Frontend
- **Framework:** React 19 Single-Page Application (SPA)
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Modern semantic utilities, responsive layouts, zero congestion)
- **Icons:** Lucide React
- **HTTP Client:** Axios (Automatic Bearer JWT token injection via request interceptors)
- **Routing:** React Router DOM v7 (Role-based protected routes with route aliases)
- **Notifications:** React Hot Toast

---

## Cloud Database & Data Architecture

SwiftShip runs on a production-ready **Aiven PostgreSQL** cloud instance configured with strict SSL/TLS verification.

### Database Migrations (`backend/db/migrations/`)
The database schema is managed via official Sequelize CLI migrations:
1. `20261008150001-create-users.js`: Creates the `users` table with ENUM roles and status constraints.
2. `20261008150002-create-rider-profiles.js`: Creates the `rider_profiles` table with vehicle information, availability states, and cascading user links.
3. `20261008150003-create-deliveries.js`: Creates the `deliveries` table with tracking numbers, coordinates, parcel specs, fees, and state constraints.
4. `20261008150004-create-payments.js`: Creates the `payments` ledger table with unique transaction references.
5. `20261008150005-create-delivery-status-logs.js`: Creates audit trail logs with actor foreign keys.

To run migrations:
```bash
npm --prefix backend run db:migrate
```

### Database Seeders (`backend/seeders/`)
Official seeders provide test data and automatically synchronize PostgreSQL serial sequences to prevent primary key collision:
- Seeds 6 initial users (1 Admin, 2 Riders, 3 Customers).
- Seeds 2 Rider profiles with vehicle compliance details.
- Seeds 3 Deliveries across different lifecycle states.
- Seeds 3 Payment ledger records matching delivery fees.
- Seeds 6 Status progression audit logs.

To seed the database:
```bash
npm --prefix backend run db:seed
```

---

## Business Logic Beyond CRUD

SwiftShip enforces realistic, production-grade business rules:

### 1. Role-Based Access Control (RBAC)
- All endpoints are protected by role-verification guards (`CUSTOMER`, `RIDER`, `ADMIN`).
- Public registration strictly prohibits registering as an `ADMIN` (enforced via Zod schema and controller validation).
- Cross-role route access triggers `403 Forbidden` (e.g., Riders cannot view Admin dashboards; Customers cannot claim delivery jobs).

### 2. Resource Ownership & Multi-Tenancy Protection
- Customers can only view, track details of, or cancel deliveries they personally created.
- Riders can only update the transit status of deliveries specifically assigned to them.
- Operations Administrators have system-wide oversight to re-assign deliveries or audit ledgers.

### 3. Courier Rider Assignment & Dispatch
- Only verified riders with an `ACTIVE` user account and `AVAILABLE` status can be assigned or accept deliveries.
- Orders in terminal states (`DELIVERED`, `CANCELLED`) cannot be dispatched or assigned to any rider.
- When an order is assigned, the assigned rider's availability status automatically transitions from `AVAILABLE` to `BUSY`.

### 4. Rider Availability State Machine
- Riders can manually toggle their state between `AVAILABLE` and `OFFLINE`.
- Riders **cannot** manually set their status to `BUSY`; `BUSY` is an exclusive system-managed invariant applied automatically when an active delivery is accepted or assigned.
- Upon successful completion (`DELIVERED`) of their active run, the rider's status automatically resets back to `AVAILABLE`.

### 5. Delivery Lifecycle Progression
Deliveries follow an immutable, strictly ordered state machine:
```text
[ Created ] ──► PENDING ──► CONFIRMED ──► ASSIGNED ──► PICKED_UP ──► IN_TRANSIT ──► DELIVERED
                   │            │
                   ▼            ▼
               CANCELLED    CANCELLED
```
- Arbitrary status jumping (e.g., jumping from `PENDING` directly to `DELIVERED`) is rejected with `400 Bad Request`.
- Status updates automatically append a snapshot entry to `delivery_status_logs` recording the timestamp, new status, and the user who triggered the change.

### 6. Payment State & Ledger Synchronization
- Pre-paid orders (`CARD`, `TRANSFER`) require a verified `SUCCESSFUL` payment transaction before transitioning to `CONFIRMED`.
- Cash on Delivery (`CASH`) orders generate a `PENDING` payment record and immediately qualify for confirmation and dispatch.
- Double-payment attempts on already settled orders are strictly rejected.
- When an Administrator issues a payment refund, the payment record transitions to `REFUNDED`.

### 7. Order Cancellation Protection
- Customers may only cancel deliveries that are in `PENDING` or `CONFIRMED` states.
- Once a delivery has been `ASSIGNED` to a rider or progressed to `PICKED_UP`, customer cancellation is strictly blocked to protect courier commitment and operational logistics.

### 8. Completed Delivery Immutability
- Deliveries that have reached `DELIVERED` are terminal.
- Terminal deliveries cannot be edited, re-dispatched, assigned to other riders, or cancelled.

### 9. User Suspension & Governance Guards
- Administrators can set any user's status to `ACTIVE`, `INACTIVE`, or `SUSPENDED`.
- Suspended users are immediately blocked from authenticating (`403 Forbidden`).
- Any active JWT tokens belonging to a suspended account are instantly rejected by the authentication middleware.

### 10. Data Privacy & Contact Masking
- The public tracking endpoint (`/api/deliveries/track/:code`) is publicly accessible without authentication.
- To protect customer and recipient personally identifiable information (PII), contact telephone numbers are automatically masked (e.g., `0803****1234`).

---

## Frontend Architecture & UI Polish

The frontend has been updated for high clarity, comfortable spacing, and strong typography:
1. **Roomy Max-Width Containers**:
   - Layouts utilize spacious container constraints (`max-w-5xl`, `max-w-6xl`, `max-w-7xl`) preventing cramped elements.
2. **Elevated Typographic Scale**:
   - Eliminated tiny unreadable fonts (`text-[10px]`, `text-[11px]`). Headings utilize `text-3xl`, `text-4xl`, and `text-5xl` with clear body text (`text-sm`, `text-base`).
3. **Tall Stakeholder Role Cards**:
   - The homepage features prominent, tall Role Cards (`min-h-[480px] sm:min-h-[500px]`, `p-8 sm:p-10`) highlighting capabilities, feature bullet lists, and direct portal sign-in buttons.
4. **Clean Production Authentication**:
   - 1-click demo login fill buttons have been removed from the login view and landing page for realistic security presentation.
   - Form inputs feature generous padding (`py-3.5 px-4 text-base rounded-2xl`) and clear labels.
5. **Grounded Universal Dark Navy Footer**:
   - Mounted globally in `App.jsx` with a responsive 4-column layout (`#0A1128`).
   - Sits flush at the bottom across all views with no awkward canvas gaps or double-footer rendering.
6. **Multi-Scope Shipping Rate Estimator**:
   - Interactive calculator supporting Domestic Nigeria, International Air Express, and Shop & Ship overseas origins with instant Naira currency conversions.

---

## System Architecture & Database Schema

```text
               +----------------------+
               |        users         |
               +----------------------+
               | id (PK)              |
               | name (NOT NULL)      |
               | email (UNIQUE)       |
               | phone (NOT NULL)     |
               | password (HASH)      |
               | role (ENUM)          |
               | status (DEFAULT ACT) |
               +----+------------+----+
                    | 1          | 1
                    |            |
                    | 1 (CASCADE)| N (CASCADE)
+-------------------v--+       +-v--------------------+
|    rider_profiles    |       |      deliveries      |
+----------------------+       +----------------------+
| id (PK)              |       | id (PK)              |
| userId (FK, UNIQUE)  |       | trackingCode (UK)    |
| vehicleType (ENUM)   |       | customerId (FK)      |
| plateNumber          |       | riderId (FK, NULL)   |
| licenseNumber        |       | pickupAddress        |
| availabilityStatus   |       | deliveryAddress      |
| rating (DECIMAL)     |       | packageType (ENUM)   |
| totalDeliveries      |       | deliveryFee (DECIMAL)|
+----------------------+       | status (ENUM)        |
                               +-----+----------+-----+
                                     | 1        | 1
                                     |          |
                                     | 1        | N (CASCADE)
                               +-----v-----+  +-v--------------------+
                               | payments  |  | delivery_status_logs |
                               +-----------+  +----------------------+
                               | id (PK)   |  | id (PK)              |
                               | amount    |  | deliveryId (FK)      |
                               | method    |  | status               |
                               | status    |  | changedBy (FK)       |
                               | ref (UK)  |  | notes                |
                               +-----------+  +----------------------+
```

---

## Complete REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register Customer or Rider (`ADMIN` blocked) |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and receive Bearer JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### Deliveries (`/api/deliveries`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/deliveries` | Customer | Create a new delivery request |
| `GET` | `/api/deliveries` | Customer / Admin | List deliveries with role filtering |
| `GET` | `/api/deliveries/:id` | Authenticated | Get delivery details and status history |
| `PUT` | `/api/deliveries/:id` | Customer / Admin | Update delivery parameters (`PENDING` only) |
| `DELETE` | `/api/deliveries/:id` | Customer / Admin | Cancel delivery (`PENDING` or `CONFIRMED` only) |
| `POST` | `/api/deliveries/:id/confirm` | Customer / Admin | Confirm order for dispatch |
| `POST` | `/api/deliveries/:id/accept` | Rider | Claim delivery job from available pool |
| `PUT` | `/api/deliveries/:id/status` | Rider / Admin | Advance status (`PICKED_UP`, `IN_TRANSIT`, `DELIVERED`) |
| `GET` | `/api/deliveries/track/:code` | Public | Live public milestone tracking with masked contact info |

### Riders (`/api/riders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/riders/profile` | Rider | Retrieve vehicle details, rating, and status |
| `PUT` | `/api/riders/profile` | Rider | Update vehicle type, plate, or license number |
| `PUT` | `/api/riders/availability` | Rider | Toggle availability (`AVAILABLE` $\leftrightarrow$ `OFFLINE`) |
| `GET` | `/api/riders/available-jobs` | Rider | Browse unassigned deliveries ready for pickup |
| `GET` | `/api/riders/history` | Rider | View completed runs and earnings history |

### Operations Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Admin | Fleet stats, volume metrics, and system health |
| `GET` | `/api/admin/users` | Admin | List all registered platform users |
| `PUT` | `/api/admin/users/:id/status` | Admin | Update user status (`ACTIVE`, `INACTIVE`, `SUSPENDED`) |
| `GET` | `/api/admin/riders` | Admin | Monitor courier fleet compliance and locations |
| `PUT` | `/api/admin/deliveries/:id/assign` | Admin | Manually dispatch or re-route delivery to rider |
| `GET` | `/api/admin/payments` | Admin | Complete financial transaction audit ledger |
| `POST` | `/api/admin/payments/:id/refund` | Admin | Issue payment refund |

### Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/:deliveryId/pay` | Customer | Process payment simulation (Card, Transfer) |
| `GET` | `/api/payments/my-payments` | Customer | View personal payment receipts |
| `GET` | `/api/payments/:id` | Authenticated | View payment transaction details |

---

## Project Directory Structure

```text
Delivery_platform/
├── backend/                            # Express 5 REST API
│   ├── config/
│   │   └── config.js                   # Sequelize cloud database config (SSL/TLS enabled)
│   ├── db/
│   │   └── migrations/                 # 5 Schema migrations
│   ├── seeders/                        # 5 Data seeders with sequence sync
│   ├── src/
│   │   ├── controllers/                # Handlers: auth, deliveries, riders, admin, payments
│   │   ├── middleware/                 # JWT auth, RBAC guards, Zod validators, error handling
│   │   ├── models/                     # Sequelize models (User, RiderProfile, Delivery, Payment, Log)
│   │   ├── routes/                     # Modular API route definitions
│   │   ├── services/                   # Business logic, state transitions, ledger service
│   │   ├── utils/                      # Pricing formulas, tracking codes, response helpers
│   │   ├── app.js                      # Express app assembly & middleware pipeline
│   │   └── server.js                   # HTTP server entry point & DB connection check
│   ├── test/                           # Backend automated test suites
│   └── package.json
├── frontend/                           # React 19 + Vite Single-Page Application
│   ├── src/
│   │   ├── components/
│   │   │   └── common/                 # Navbar, Footer, StatusBadge, DeliveryStepper, Modal
│   │   ├── context/                    # AuthContext (JWT storage, login/logout, role state)
│   │   ├── lib/                        # Axios instance, formatting helpers, rate calculators
│   │   ├── pages/
│   │   │   ├── public/                 # Home, Login, Register, TrackDelivery
│   │   │   ├── customer/               # CustomerDashboard, CreateDelivery, Deliveries, Payments
│   │   │   ├── rider/                  # RiderDashboard, AvailableJobs, ActiveDelivery, History
│   │   │   └── admin/                  # AdminDashboard, Deliveries, Dispatch, Users, Riders, Finance
│   │   ├── App.jsx                     # Route mappings with role protected guards & universal footer
│   │   └── index.css                   # Tailwind CSS styling
│   ├── vite.config.js                  # Vite configuration & proxy definitions
│   └── package.json
├── .env.example                        # Security-hardened template (keys only)
├── package.json                        # Root monorepo orchestration scripts
└── README.md                           # Documentation
```

---

## Getting Started & Running Locally

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database (or use the configured Aiven PostgreSQL cloud instance)

### 2. Environment Configuration

**Backend (`backend/.env`):**
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key
DATABASE_URL=postgres://user:password@host:port/database?sslmode=require
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://your-frontend-domain.com,*
```

**Frontend (`frontend/.env`):**
```ini
# Production Hosted Backend API
VITE_API_URL=https://your-backend-api.onrender.com/api
```

### 3. Install Dependencies
From the repository root:
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 4. Database Setup
```bash
# Run database migrations:
npm --prefix backend run db:migrate

# Seed sample data (optional):
npm --prefix backend run db:seed
```

### 5. Start the Application
```bash
# Run both Backend (:5000) and Frontend (:3000) concurrently:
npm run dev
```

Alternatively, run services independently:
```bash
# Backend only:
npm run dev:backend

# Frontend only:
npm run dev:frontend
```

---

## Testing & Quality Verification

Run the comprehensive test suite verifying database connectivity, RBAC invariants, business logic, and frontend build:

```bash
# Run backend test suite:
npm --prefix backend test

# Build frontend production bundle:
npm --prefix frontend run build
```

The test runner validates:
- **Sweep 1:** Platform invariants, admin registration block, fee calculation engine, lifecycle state machines, rider availability, and Sequelize associations.
- **Sweep 2:** Security verification, unauthenticated access rejection (401), RBAC authorization (403), public tracking, and PostgreSQL database connectivity.
- **Sweep 3:** Advanced business rules: cash confirmation, card pre-payment invariants, double payment prevention, system-managed busy states, PII contact masking, cancellation protections, and completed delivery tamper resistance.
- **Frontend Build Check:** Clean Vite compilation of all 21 views and routing components.

---

## Demo Credentials

The seeded database contains sample accounts for testing each platform role:

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@delivery.com` | `Admin@123` | Operations Console, user & fleet governance |
| **Rider 1** | `rider1@delivery.com` | `Rider@123` | Courier Rider (Motorcycle, `AVAILABLE`) |
| **Rider 2** | `rider2@delivery.com` | `Rider@123` | Courier Rider (Delivery Van, `OFFLINE`) |
| **Customer 1** | `customer1@delivery.com` | `Customer@123` | Active customer with delivery history |
| **Customer 2** | `customer2@delivery.com` | `Customer@123` | Customer with pending orders |

---

## License

This project is licensed under the MIT License.
