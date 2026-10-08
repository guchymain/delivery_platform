# SwiftShip — Delivery System Platform

A production-grade, full-stack Delivery Platform connecting Customers, Riders, and Administrators. Built with a **Node.js (Express 5)** RESTful backend powered by **PostgreSQL** & **Sequelize ORM**, paired with a modern **React 19 / Vite / Tailwind CSS v4** single-page frontend.

---

## Table of Contents

- [Overview & Actors](#overview--actors)
- [Tech Stack](#tech-stack)
- [Project Directory Structure](#project-directory-structure)
- [System Architecture & Database Schema](#system-architecture--database-schema)
- [Delivery Lifecycle State Machine](#delivery-lifecycle-state-machine)
- [Rider Availability & Payment Rules](#rider-availability--payment-rules)
- [Frontend Architecture & Role Portals](#frontend-architecture--role-portals)
- [Complete Backend API Reference](#complete-backend-api-reference)
- [Security & Environment Hardening](#security--environment-hardening)
- [Running the Application](#running-the-application)
- [Testing & Quality Verification](#testing--quality-verification)
- [Thunder Client Testing Guide](#thunder-client-testing-guide)

---

## Overview & Actors

SwiftShip provides an integrated platform supporting three primary actors:

1. **CUSTOMER**:
   - Create delivery requests with pickup and delivery addresses, recipient details, and package specifications.
   - Real-time delivery fee calculation ($5.00 base up to 1kg + $1.50/kg for additional weight).
   - Simulate and record payments (`CARD`, `TRANSFER`, `CASH`).
   - Live public and private tracking with visual progression steppers.
   - Manage orders, view delivery history, and update personal account profile.

2. **RIDER**:
   - Manage active availability status (`AVAILABLE`, `BUSY`, `OFFLINE`).
   - Browse and claim unassigned delivery jobs.
   - Advance deliveries through transit checkpoints (`PICKED_UP`, `IN_TRANSIT`, `DELIVERED`).
   - Review delivery history, completed runs, and earnings.

3. **ADMIN**:
   - Platform governance and system overview metrics.
   - User account lifecycle management (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
   - Rider fleet monitoring, vehicle compliance, and manual job dispatch/reassignment.
   - Audit payments, verify transaction references, and issue refunds.

---

## Tech Stack

### Backend
- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js 5
- **Database:** PostgreSQL
- **ORM:** Sequelize 6 & Sequelize CLI (migrations, seeders, associations)
- **Validation:** Zod 4 (strict schema enforcement on body, params, and query)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcrypt` password hashing
- **Security:** `cors`, `express-rate-limit`, `dotenv` (strict fail-fast loading, zero secret fallbacks)

### Frontend
- **Framework:** React 19 (SPA)
- **Bundler:** Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons:** Lucide React
- **HTTP Client:** Axios (automatic Bearer token injection)
- **Routing:** React Router DOM v7 (role-based protected routes with alias redirects)
- **Notifications:** React Hot Toast

---

## Project Directory Structure

```text
Delivery_platform/
├── backend/                            # Express 5 REST API
│   ├── db/
│   │   ├── config.js                   # Sequelize database configuration
│   │   ├── migrations/                 # Sequelize migration scripts
│   │   ├── seeders/                    # Seed demo users & sample records
│   │   └── setup.sql                   # Database and user creation SQL
│   ├── src/
│   │   ├── controllers/                # Request handlers (auth, deliveries, riders, admin, payments)
│   │   ├── middleware/                 # JWT auth, RBAC guards, Zod validator, error handler
│   │   ├── models/                     # Sequelize models & associations
│   │   ├── routes/                     # Connected REST route modules
│   │   ├── services/                   # Business logic, state transitions, ledger records
│   │   ├── utils/                      # Constants, pricing calculations, tracking codes
│   │   ├── app.js                      # Express application assembly
│   │   └── server.js                   # Entry point and DB health check
│   ├── test/                           # Backend test suites (api.test.js)
│   └── package.json
├── frontend/                           # React 19 + Vite Single-Page Application
│   ├── src/
│   │   ├── components/common/          # Navbar, DeliveryStepper, StatusBadge, Modal, ProtectedRoute
│   │   ├── context/                    # AuthContext (token storage, login/logout, user role)
│   │   ├── lib/                        # Axios API client, utils, pricing calculation, formatting
│   │   ├── pages/
│   │   │   ├── public/                 # Home, Login, Register, TrackDelivery
│   │   │   ├── customer/               # Dashboard, CreateDelivery, Deliveries, Detail, Payments, Profile
│   │   │   ├── rider/                  # Dashboard, AvailableJobs, ActiveDelivery, History, Profile
│   │   │   └── admin/                  # Dashboard, Deliveries, Dispatch, Users, Riders, Payments
│   │   ├── App.jsx                     # Route mappings with fallback aliases
│   │   └── index.css                   # Tailwind CSS v4 styles
│   ├── vite.config.js                  # Vite configuration & proxy settings
│   └── package.json
├── test/                               # Monorepo verification suites
│   ├── api.test.js                     # Sweep 1 & Sweep 2 (backend invariants, RBAC, DB check)
│   └── unification.test.mjs            # Sweep 3 (frontend views integrity, route mappings)
├── .gitignore                          # Merged root VCS ignore (backend, frontend, envs, build artifacts)
├── .env.example                        # Security-hardened root template (keys only, zero secret values)
├── package.json                        # Root orchestration scripts (concurrent dev, test, build)
└── README.md                           # Unified full-stack documentation
```

---

## System Architecture & Database Schema

### Entity-Relationship Diagram

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

### Table Specifications & Constraints

| Table | Column | Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| **users** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| | `name` | VARCHAR | NOT NULL | User's full name |
| | `email` | VARCHAR | NOT NULL, UNIQUE | User's email address |
| | `phone` | VARCHAR | NOT NULL | Contact telephone |
| | `password` | VARCHAR | NOT NULL | Bcrypt hash (never returned in responses) |
| | `role` | VARCHAR | NOT NULL, DEFAULT `'CUSTOMER'` | `'CUSTOMER'`, `'RIDER'`, `'ADMIN'` |
| | `status` | VARCHAR | NOT NULL, DEFAULT `'ACTIVE'` | `'ACTIVE'`, `'INACTIVE'`, `'SUSPENDED'` |
| **rider_profiles** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Profile identifier |
| | `userId` | INTEGER | NOT NULL, UNIQUE, FK $\to$ `users(id)` (`CASCADE`) | Referencing rider user |
| | `vehicleType` | VARCHAR | NOT NULL, DEFAULT `'MOTORCYCLE'` | `'BICYCLE'`, `'MOTORCYCLE'`, `'CAR'`, `'VAN'` |
| | `plateNumber` | VARCHAR | NULLABLE | Vehicle registration number |
| | `licenseNumber` | VARCHAR | NULLABLE | Driver/Rider license number |
| | `availabilityStatus` | VARCHAR | NOT NULL, DEFAULT `'OFFLINE'` | `'AVAILABLE'`, `'BUSY'`, `'OFFLINE'` |
| | `rating` | DECIMAL(3, 2) | NOT NULL, DEFAULT `5.00` | Average star rating |
| | `totalDeliveries` | INTEGER | NOT NULL, DEFAULT `0` | Completed delivery count |
| **deliveries** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Delivery request identifier |
| | `trackingCode` | VARCHAR | NOT NULL, UNIQUE | Human-readable tracking number |
| | `customerId` | INTEGER | NOT NULL, FK $\to$ `users(id)` (`CASCADE`) | Requesting customer |
| | `riderId` | INTEGER | NULLABLE, FK $\to$ `users(id)` (`SET NULL`) | Assigned courier |
| | `pickupAddress` | TEXT | NOT NULL | Origin address |
| | `pickupContactName` | VARCHAR | NOT NULL | Contact at pickup |
| | `pickupContactPhone` | VARCHAR | NOT NULL | Contact phone at pickup |
| | `deliveryAddress` | TEXT | NOT NULL | Destination address |
| | `recipientName` | VARCHAR | NOT NULL | Name of recipient |
| | `recipientPhone` | VARCHAR | NOT NULL | Recipient telephone |
| | `packageType` | VARCHAR | NOT NULL, DEFAULT `'PARCEL'` | Package category |
| | `packageWeight` | DECIMAL(6, 2) | NOT NULL, DEFAULT `1.00` | Weight in kilograms |
| | `packageDescription` | TEXT | NULLABLE | Notes / description |
| | `deliveryFee` | DECIMAL(10, 2) | NOT NULL, DEFAULT `0.00` | Computed shipping charge |
| | `status` | VARCHAR | NOT NULL, DEFAULT `'PENDING'` | Lifecycle state |
| **payments** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Payment transaction identifier |
| | `deliveryId` | INTEGER | NOT NULL, FK $\to$ `deliveries(id)` (`CASCADE`) | Target delivery |
| | `amount` | DECIMAL(10, 2) | NOT NULL | Transaction sum |
| | `paymentMethod` | VARCHAR | NOT NULL, DEFAULT `'CARD'` | `'CASH'`, `'CARD'`, `'TRANSFER'` |
| | `paymentStatus` | VARCHAR | NOT NULL, DEFAULT `'PENDING'` | `'PENDING'`, `'SUCCESSFUL'`, `'FAILED'`, `'REFUNDED'` |
| | `transactionReference`| VARCHAR | NOT NULL, UNIQUE | Unique ledger reference code |
| **delivery_status_logs**| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Audit log identifier |
| | `deliveryId` | INTEGER | NOT NULL, FK $\to$ `deliveries(id)` (`CASCADE`) | Target delivery |
| | `status` | VARCHAR | NOT NULL | Snapshot state |
| | `changedBy` | INTEGER | NULLABLE, FK $\to$ `users(id)` (`SET NULL`) | Actor triggering change |
| | `notes` | TEXT | NULLABLE | Transition comments |

---

## Delivery Lifecycle State Machine

A delivery progresses through a strictly controlled state machine:

```text
               [ Create Delivery ]
                        │
                        ▼
                   ┌─────────┐
       ┌───────────│ PENDING │──────────┐
       │           └─────────┘          │
       │ (Cancel)       │ (Payment)     │ (Cancel)
       ▼                ▼               ▼
┌───────────┐     ┌───────────┐   ┌───────────┐
│ CANCELLED │◄────│ CONFIRMED │   │ CANCELLED │
└───────────┘     └───────────┘   └───────────┘
                        │
                        │ (Rider Accepts or Admin Assigns)
                        ▼
                  ┌───────────┐
                  │ ASSIGNED  │
                  └───────────┘
                        │
                        │ (Rider: Package Collected)
                        ▼
                 ┌─────────────┐
                 │  PICKED_UP  │
                 └─────────────┘
                        │
                        │ (Rider: En Route)
                        ▼
                 ┌─────────────┐
                 │ IN_TRANSIT  │
                 └─────────────┘
                        │
                        │ (Rider: Delivered to Recipient)
                        ▼
                  ┌───────────┐
                  │ DELIVERED │ (Terminal state)
                  └───────────┘
```

### Transition Invariants
- **`PENDING`**: Initial state upon order placement. Can transition to `CONFIRMED` upon payment or `CANCELLED` by customer.
- **`CONFIRMED`**: Delivery has verified payment or cash pledge. Eligible for rider claim or admin dispatch. Can still be `CANCELLED`.
- **`ASSIGNED`**: Rider is bound to delivery. Once assigned, order CANNOT be cancelled by the customer.
- **`PICKED_UP`**: Rider has retrieved item from sender.
- **`IN_TRANSIT`**: Courier is traveling toward recipient.
- **`DELIVERED`**: Final successful drop-off. Rider availability resets to `AVAILABLE`.
- **`CANCELLED`**: Permitted only while status is `PENDING` or `CONFIRMED`.

---

## Rider Availability & Payment Rules

### Rider Availability States
- **`AVAILABLE`**: Rider is on-duty and eligible to browse or be dispatched jobs.
- **`BUSY`**: Rider has an active delivery. Automatically assigned by system upon order acceptance; cannot be set manually.
- **`OFFLINE`**: Rider is off-duty and cannot accept new deliveries.

### Payment Rules
- **Payment Methods**: `CASH`, `CARD`, `TRANSFER`.
- **Payment Statuses**: `PENDING`, `SUCCESSFUL`, `FAILED`, `REFUNDED`.
- Cash payments create a `PENDING` payment ledger entry with immediate `CONFIRMED` status.
- Card/transfer payments auto-advance to `CONFIRMED` once status is updated to `SUCCESSFUL`.
- Administrators can refund completed payments, updating the status to `REFUNDED`.

---

## Frontend Architecture & Role Portals

The frontend comprises 21 dedicated pages and views:

1. **Public Pages**:
   - `Home.jsx` (`/`): Landing page, live service highlights, instant package tracker.
   - `Login.jsx` (`/login`): Authentication with 1-click test credentials for Customer, Rider, and Admin.
   - `Register.jsx` (`/register`): Role selector for Customer and Rider. Admin registration is strictly blocked.
   - `TrackDelivery.jsx` (`/track`): Public tracking interface with real-time status visualizer.

2. **Customer Portal**:
   - `CustomerDashboard.jsx` (`/customer`): Overview metrics and active orders.
   - `CreateDelivery.jsx` (`/customer/create-delivery`): Booking form with real-time fee calculation.
   - `CustomerDeliveries.jsx` (`/customer/deliveries`): Filterable delivery history.
   - `DeliveryDetail.jsx` (`/customer/deliveries/:id`): Tracking timeline and cancellation.
   - `CustomerPayments.jsx` (`/customer/payments`): Payment receipts and history.
   - `CustomerProfile.jsx` (`/customer/profile`): Profile management.

3. **Rider Portal**:
   - `RiderDashboard.jsx` (`/rider`): Availability toggle and active shift metrics.
   - `AvailableJobs.jsx` (`/rider/jobs`): Available delivery board with 1-click acceptance.
   - `ActiveDelivery.jsx` (`/rider/active`): Live delivery console (`PICKED_UP` $\to$ `DELIVERED`).
   - `RiderHistory.jsx` (`/rider/history`): Completed run logs and gross earnings.
   - `RiderProfile.jsx` (`/rider/profile`): Vehicle specs, license details, and ratings.

4. **Admin Portal**:
   - `AdminDashboard.jsx` (`/admin`): Metrics, volume trends, and fleet distribution.
   - `AdminDeliveries.jsx` (`/admin/deliveries`): Delivery management and status overrides.
   - `AdminDispatch.jsx` (`/admin/dispatch`): Manual rider assignment console.
   - `AdminUsers.jsx` (`/admin/users`): User governance (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
   - `AdminRiders.jsx` (`/admin/riders`): Rider compliance and vehicle monitor.
   - `AdminPayments.jsx` (`/admin/payments`): Financial ledger and payment refunds.

---

## Complete Backend API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register Customer or Rider (`ADMIN` role strictly prohibited).
- `POST /api/auth/login`: Authenticate credentials and receive JWT.
- `GET /api/auth/me`: Retrieve authenticated user identity profile.

### Deliveries (`/api/deliveries`)
- `POST /api/deliveries`: Create new delivery request (Customer only).
- `GET /api/deliveries`: List deliveries with role filtering (Customer / Admin).
- `GET /api/deliveries/:id`: Detailed delivery status and tracking log.
- `PUT /api/deliveries/:id`: Update delivery parameters (`PENDING` state only).
- `DELETE /api/deliveries/:id`: Cancel delivery request (`PENDING` or `CONFIRMED` only).
- `POST /api/deliveries/:id/accept`: Claim delivery job (Rider only).
- `PUT /api/deliveries/:id/status`: Update transit status (`PICKED_UP`, `IN_TRANSIT`, `DELIVERED`).
- `GET /api/deliveries/track/:trackingCode`: Public tracking endpoint without authentication.

### Riders (`/api/riders`)
- `GET /api/riders/profile`: Retrieve rider vehicle specs and status.
- `PUT /api/riders/profile`: Update vehicle and license details.
- `PUT /api/riders/availability`: Toggle availability (`AVAILABLE` $\leftrightarrow$ `OFFLINE`).
- `GET /api/riders/available-jobs`: List open unassigned deliveries.
- `GET /api/riders/history`: View completed deliveries and earnings.

### Administration (`/api/admin`)
- `GET /api/admin/overview`: System KPI metrics, fleet status, and volume stats.
- `GET /api/admin/users`: List platform users with status filters.
- `PUT /api/admin/users/:id/status`: Update account status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
- `GET /api/admin/riders`: List all registered riders and vehicle data.
- `PUT /api/admin/deliveries/:id/assign`: Manually assign delivery to rider.
- `PUT /api/admin/deliveries/:id/status`: Administrative status override.
- `GET /api/admin/payments`: Global payment ledger.
- `POST /api/admin/payments/:id/refund`: Issue payment refund.

### Payments (`/api/payments`)
- `POST /api/payments/:deliveryId/pay`: Process simulated payment for delivery.
- `GET /api/payments/my-payments`: Customer payment history.
- `GET /api/payments/:id`: Payment transaction detail.

---

## Security & Environment Hardening

1. **Strict Secrets Separation**:
   - Zero hardcoded passwords, tokens, or live credentials exist in `.env.example`, `frontend/.env.example`, or documentation.
   - All environment templates contain only variable keys with empty values.
2. **Zero Fallback Substitution**:
   - Backend environment variables use strict, fail-fast checking with no `||` fallback substitutions.
3. **Authentication & Authorization**:
   - Passwords securely hashed with `bcrypt` (10 rounds).
   - JWT tokens signed with mandatory `JWT_SECRET`.
   - Role-based authorization middleware enforcing least privilege (`CUSTOMER`, `RIDER`, `ADMIN`).
   - Inactive or suspended user tokens are rejected with `403 Forbidden`.

---

## Running the Application

### 1. Unified Concurrent Mode (Recommended)
From the root directory:
```bash
# Start both Backend (:5000) and Frontend (:3000) concurrently:
npm run dev
```

### 2. Independent Service Mode
```bash
# Backend REST API only:
npm run dev:backend

# Frontend React SPA only:
npm run dev:frontend
```

### 3. Production Build
```bash
# Build frontend client assets:
npm run build
```

---

## Testing & Quality Verification

Run the full verification suite across all backend and frontend components:

```bash
npm test
```

This executes:
- **Sweep 1:** Platform invariants, admin registration block, fee calculation engine, lifecycle state machines, rider availability, and Sequelize associations.
- **Sweep 2:** Security verification, unauthenticated access rejection (401), RBAC authorization (403), public tracking, and PostgreSQL database connectivity.
- **Vite Build Check:** Clean compilation of all frontend assets.
- **Sweep 3:** Frontend integrity check, default exports for all 21 views, and route mappings in `App.jsx`.

---

## Thunder Client Testing Guide

### Seeded Credentials
- **Admin:** `admin@delivery.com` / `Admin@123`
- **Rider 1:** `rider1@delivery.com` / `Rider@123` (Motorcycle, `AVAILABLE`)
- **Rider 2:** `rider2@delivery.com` / `Rider@123` (Van, `OFFLINE`)
- **Customer 1:** `customer1@delivery.com` / `Customer@123`
- **Customer 2:** `customer2@delivery.com` / `Customer@123`

### Step-by-Step Test Sequence

#### 1. Public Registration & Role Blocking
- **Verify Admin Registration is Blocked:**
  - `POST http://localhost:5000/api/auth/register`
  - Body:
    ```json
    {
      "name": "Attacker",
      "email": "attacker@test.com",
      "phone": "08011112222",
      "password": "Password@123",
      "role": "ADMIN"
    }
    ```
  - Response: `400 Bad Request` ("Admin registration is strictly prohibited").

- **Register New Customer:**
  - `POST http://localhost:5000/api/auth/register`
  - Body:
    ```json
    {
      "name": "Chidi Customer",
      "email": "chidi@test.com",
      "phone": "08033334444",
      "password": "Password@123",
      "role": "CUSTOMER"
    }
    ```
  - Response: `201 Created` with JWT token.

#### 2. Complete Customer Delivery Flow
- **Login Customer:**
  - `POST http://localhost:5000/api/auth/login`
  - Body: `{"email": "customer1@delivery.com", "password": "Customer@123"}`
  - Save `token` as `CUSTOMER_TOKEN`.

- **Create Delivery Request:**
  - Header: `Authorization: Bearer <CUSTOMER_TOKEN>`
  - `POST http://localhost:5000/api/deliveries`
  - Body:
    ```json
    {
      "pickupAddress": "10 Broad Street, Lagos Island",
      "pickupContactName": "Alice Customer",
      "pickupContactPhone": "08030000001",
      "deliveryAddress": "22 Bourdillon Road, Ikoyi",
      "recipientName": "Folake Coker",
      "recipientPhone": "08090000005",
      "packageType": "PARCEL",
      "packageWeight": 2.5,
      "packageDescription": "Fashion accessories box",
      "paymentMethod": "CARD"
    }
    ```
  - Fee is automatically calculated as `$7.25` ($5.00 + 1.5 * $1.50). Status is `PENDING`. Save `id` and `trackingCode`.

- **Process Payment (Simulated):**
  - Header: `Authorization: Bearer <CUSTOMER_TOKEN>`
  - `POST http://localhost:5000/api/payments/<id>/pay`
  - Body: `{"paymentMethod": "CARD"}`
  - Delivery automatically updates to `CONFIRMED`.

- **Public Tracking:**
  - `GET http://localhost:5000/api/deliveries/track/<trackingCode>`
  - Returns current status and full timeline log without authentication.

#### 3. Rider Workflow
- **Login Rider:**
  - `POST http://localhost:5000/api/auth/login`
  - Body: `{"email": "rider1@delivery.com", "password": "Rider@123"}`
  - Save `token` as `RIDER_TOKEN`.

- **Set Availability:**
  - Header: `Authorization: Bearer <RIDER_TOKEN>`
  - `PUT http://localhost:5000/api/riders/availability`
  - Body: `{"availabilityStatus": "AVAILABLE"}`

- **Browse Available Jobs:**
  - Header: `Authorization: Bearer <RIDER_TOKEN>`
  - `GET http://localhost:5000/api/riders/available-jobs`

- **Accept Delivery Job:**
  - Header: `Authorization: Bearer <RIDER_TOKEN>`
  - `POST http://localhost:5000/api/deliveries/<id>/accept`
  - Delivery status updates to `ASSIGNED`; rider availability status updates to `BUSY`.

- **Update Progress:**
  - `PUT http://localhost:5000/api/deliveries/<id>/status` with `{"status": "PICKED_UP"}`
  - `PUT http://localhost:5000/api/deliveries/<id>/status` with `{"status": "IN_TRANSIT"}`
  - `PUT http://localhost:5000/api/deliveries/<id>/status` with `{"status": "DELIVERED"}`
  - Upon delivery, rider availability automatically resets to `AVAILABLE`.

#### 4. Admin Governance
- **Login Admin:**
  - `POST http://localhost:5000/api/auth/login`
  - Body: `{"email": "admin@delivery.com", "password": "Admin@123"}`
  - Save `token` as `ADMIN_TOKEN`.

- **View System Overview:**
  - Header: `Authorization: Bearer <ADMIN_TOKEN>`
  - `GET http://localhost:5000/api/admin/overview`

- **Suspend Malicious User:**
  - Header: `Authorization: Bearer <ADMIN_TOKEN>`
  - `PUT http://localhost:5000/api/admin/users/<userId>/status`
  - Body: `{"status": "SUSPENDED"}`
