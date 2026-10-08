# Delivery Platform REST API

A full-featured Delivery Platform System RESTful API built with **Node.js (Express 5)**, **PostgreSQL**, **Sequelize ORM** (migrations, seeders, associations), and **Zod** schema validation.

The system connects three platform actors with specialized workflows and permissions:
- **CUSTOMER**: Places delivery requests, specifies pickup & dropoff coordinates/details, tracks delivery progress, manages orders, makes payments, and maintains account history.
- **RIDER**: Manages availability (`AVAILABLE`, `BUSY`, `OFFLINE`), views and accepts open jobs, updates package transit states (`PICKED_UP`, `IN_TRANSIT`, `DELIVERED`), and reviews job history.
- **ADMIN**: Full platform governance, user lifecycle management (`ACTIVE`, `INACTIVE`, `SUSPENDED`), rider fleet management, manual rider dispatching/reassignment, payment oversight, and delivery monitoring.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [System Architecture & Database Schema](#system-architecture--database-schema)
- [Delivery Lifecycle State Machine](#delivery-lifecycle-state-machine)
- [Rider Availability & Payment Rules](#rider-availability--payment-rules)
- [Complete API Reference](#complete-api-reference)
- [Database Setup & Running the Application](#database-setup--running-the-application)
- [Testing & Quality Verification](#testing--quality-verification)
- [Thunder Client Testing Guide](#thunder-client-testing-guide)

---

## Tech Stack

- **Runtime:** Node.js (CommonJS)
- **Framework:** Express.js 5
- **Database:** PostgreSQL
- **ORM:** Sequelize 6 & Sequelize CLI (migrations, seeders, associations)
- **Validation:** Zod 4 (strict schema enforcement on body, params, and query)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcrypt` password hashing
- **Security & Utilities:** `cors`, `express-rate-limit`, `dotenv`

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
| | `userId` | INTEGER | NOT NULL, UNIQUE, FK $\to$ `users(id)` (`ON DELETE CASCADE`) | Referencing rider user |
| | `vehicleType` | VARCHAR | NOT NULL, DEFAULT `'MOTORCYCLE'` | `'BICYCLE'`, `'MOTORCYCLE'`, `'CAR'`, `'VAN'` |
| | `plateNumber` | VARCHAR | NULLABLE | Vehicle registration number |
| | `licenseNumber` | VARCHAR | NULLABLE | Driver/Rider license number |
| | `availabilityStatus` | VARCHAR | NOT NULL, DEFAULT `'OFFLINE'` | `'AVAILABLE'`, `'BUSY'`, `'OFFLINE'` |
| | `rating` | DECIMAL(3, 2) | NOT NULL, DEFAULT `5.00` | Average star rating |
| | `totalDeliveries` | INTEGER | NOT NULL, DEFAULT `0` | Count of completed deliveries |
| **deliveries** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Delivery request ID |
| | `trackingCode` | VARCHAR | NOT NULL, UNIQUE | Human-readable tracking number (`DEL-...`) |
| | `customerId` | INTEGER | NOT NULL, FK $\to$ `users(id)` (`ON DELETE CASCADE`) | Customer who placed the delivery |
| | `riderId` | INTEGER | NULLABLE, FK $\to$ `users(id)` (`ON DELETE SET NULL`) | Assigned courier rider |
| | `pickupAddress` | VARCHAR | NOT NULL | Origin address |
| | `deliveryAddress` | VARCHAR | NOT NULL | Destination address |
| | `packageType` | VARCHAR | NOT NULL, DEFAULT `'PARCEL'` | `'DOCUMENTS'`, `'PARCEL'`, `'FOOD'`, `'FRAGILE'`, `'ELECTRONICS'`, `'BOX'` |
| | `packageWeight` | DECIMAL(8, 2) | DEFAULT `1.00` | Package weight in kg |
| | `deliveryFee` | DECIMAL(10, 2) | NOT NULL, DEFAULT `5.00` | Fee: `$5.00` base + `$1.50/kg` over 1 kg |
| | `status` | VARCHAR | NOT NULL, DEFAULT `'PENDING'` | Lifecycle status |
| **payments** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Payment record ID |
| | `deliveryId` | INTEGER | NOT NULL, UNIQUE, FK $\to$ `deliveries(id)` (`ON DELETE CASCADE`) | Associated delivery |
| | `userId` | INTEGER | NOT NULL, FK $\to$ `users(id)` (`ON DELETE CASCADE`) | Payer user ID |
| | `amount` | DECIMAL(10, 2) | NOT NULL | Total delivery charge |
| | `paymentMethod` | VARCHAR | NOT NULL, DEFAULT `'CASH'` | `'CASH'`, `'CARD'`, `'TRANSFER'` |
| | `paymentStatus` | VARCHAR | NOT NULL, DEFAULT `'PENDING'` | `'PENDING'`, `'SUCCESSFUL'`, `'FAILED'`, `'REFUNDED'` |
| | `transactionReference` | VARCHAR | NOT NULL, UNIQUE | Unique payment transaction reference |
| **delivery_status_logs** | `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Audit log ID |
| | `deliveryId` | INTEGER | NOT NULL, FK $\to$ `deliveries(id)` (`ON DELETE CASCADE`) | Delivery reference |
| | `status` | VARCHAR | NOT NULL | New status reached |
| | `changedBy` | INTEGER | NOT NULL, FK $\to$ `users(id)` (`ON DELETE CASCADE`) | User who triggered the state change |
| | `notes` | TEXT | NULLABLE | Context or reason |

---

## Delivery Lifecycle State Machine

```text
  [PENDING] ------------------------> [CONFIRMED] ------------------------> [ASSIGNED]
      |                                    |                                    |
      +-----> [CANCELLED] <----------------+-----> [CANCELLED] <----------------+
                                                                                |
                                                                                v
                                                                           [PICKED_UP]
                                                                                |
                                                                                v
                                                                           [IN_TRANSIT]
                                                                                |
                                                                                v
                                                                           [DELIVERED]
```

### Transition Invariants
1. `PENDING` $\to$ `CONFIRMED` or `CANCELLED`.
2. `CONFIRMED` $\to$ `ASSIGNED` (when Rider accepts or Admin assigns) or `CANCELLED`.
3. `ASSIGNED` $\to$ `PICKED_UP` (by assigned Rider), `CONFIRMED` (if unassigned by Admin), or `CANCELLED` (by Admin; frees rider).
4. `PICKED_UP` $\to$ `IN_TRANSIT` (by assigned Rider). Customer cannot cancel once picked up.
5. `IN_TRANSIT` $\to$ `DELIVERED` (by assigned Rider). Completing dropoff resets rider availability to `AVAILABLE`, increments completed count, and reconciles cash payments to `SUCCESSFUL`.
6. `DELIVERED` and `CANCELLED` are terminal states.

---

## Rider Availability & Payment Rules

### Rider Availability
- States: `AVAILABLE`, `BUSY`, `OFFLINE`.
- A rider can manually toggle between `AVAILABLE` and `OFFLINE` when not actively delivering.
- When a rider accepts a job or is assigned by an admin, the rider's availability status automatically transitions to `BUSY`.
- When the job reaches `DELIVERED` or is `CANCELLED`, the rider's status automatically resets to `AVAILABLE`.

### Payments
- Methods: `CASH`, `CARD`, `TRANSFER`.
- Statuses: `PENDING`, `SUCCESSFUL`, `FAILED`, `REFUNDED`.
- `CARD` and `TRANSFER` simulate instant gateway confirmation (`SUCCESSFUL`).
- `CASH` on delivery remains `PENDING` until the rider marks the package `DELIVERED`, automatically reconciling the payment to `SUCCESSFUL`.
- Admin can issue refunds for cancelled/eligible orders, marking payment as `REFUNDED`.

---

## Complete API Reference

All routes are prefixed with `/api`.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register Customer or Rider (`role: ADMIN` strictly prohibited) |
| `POST` | `/api/auth/login` | Public | Login with email and password (checks `ACTIVE` vs `SUSPENDED`) |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile with rider details |
| `PUT` | `/api/auth/password` | Authenticated | Change account password |

### 2. Deliveries (`/api/deliveries`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/deliveries` | Customer | Create delivery request with automatic fee & payment record |
| `GET` | `/api/deliveries` | Authenticated | List deliveries (scoped by role: Customer sees own, Rider sees assigned, Admin sees all) |
| `GET` | `/api/deliveries/:id` | Authenticated | Get full delivery details with customer, rider, payment, and status logs |
| `GET` | `/api/deliveries/track/:trackingCode` | Public / Auth | Track delivery progress using tracking code |
| `PUT` | `/api/deliveries/:id` | Customer / Admin | Edit delivery details (allowed only while status is `PENDING`) |
| `POST` | `/api/deliveries/:id/confirm` | Customer / Admin | Confirm delivery request |
| `POST` | `/api/deliveries/:id/cancel` | Customer / Admin | Cancel delivery (Customer allowed if `PENDING` or `CONFIRMED`) |
| `POST` | `/api/deliveries/:id/accept` | Rider | Rider accepts confirmed job (transitions to `ASSIGNED`, rider becomes `BUSY`) |
| `PUT` | `/api/deliveries/:id/status` | Rider / Admin | Advance lifecycle (`PICKED_UP` $\to$ `IN_TRANSIT` $\to$ `DELIVERED`) |

### 3. Riders (`/api/riders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/riders/profile` | Rider | View rider vehicle profile and performance stats |
| `PUT` | `/api/riders/profile` | Rider | Update vehicle type, plate number, license |
| `PUT` | `/api/riders/availability` | Rider | Toggle availability (`AVAILABLE` $\leftrightarrow$ `OFFLINE`; blocked if `BUSY`) |
| `GET` | `/api/riders/available-jobs` | Rider | Browse unassigned `CONFIRMED` jobs ready for pickup |
| `GET` | `/api/riders/history` | Rider | View past completed jobs and earnings summary |

### 4. Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/:id/pay` | Customer / Admin | Record payment (`CARD`, `TRANSFER`, or `CASH`) |
| `GET` | `/api/payments` | Authenticated | List payments (Customer sees own, Admin sees all) |
| `GET` | `/api/payments/:id` | Authenticated | View payment receipt details |
| `POST` | `/api/payments/:id/refund` | Admin | Refund successful payment |

### 5. Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/overview` | Admin | System dashboard metrics (users, riders, deliveries, revenue) |
| `GET` | `/api/admin/users` | Admin | List all platform users with role & status filters |
| `GET` | `/api/admin/users/:id` | Admin | User detail with customer and rider job statistics |
| `PUT` | `/api/admin/users/:id/status` | Admin | Update user status (`ACTIVE`, `INACTIVE`, `SUSPENDED`) |
| `PUT` | `/api/admin/users/:id` | Admin | Update user details or role |
| `DELETE`| `/api/admin/users/:id` | Admin | Safe delete user |
| `GET` | `/api/admin/riders` | Admin | View rider fleet availability and ratings |
| `PUT` | `/api/admin/deliveries/:id/assign` | Admin | Manually dispatch or reassign rider to a delivery |

### 6. User Account Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Authenticated | View current profile |
| `PUT` | `/api/users/profile` | Authenticated | Update personal profile (name, phone) |
| `POST` | `/api/users/deactivate` | Authenticated | Deactivate own account |

---

## Database Setup & Running the Application

### 1. Provision the PostgreSQL Database
Execute the bootstrap script as PostgreSQL superuser to create `delivery_platform_db` and user `delivery_user`:

```bash
sudo -u postgres psql < backend/db/setup.sql
```

### 2. Configure Environment Variables
Confirm credentials in `backend/.env` (keys required):
```env
PORT=
NODE_ENV=
JWT_SECRET=
JWT_EXPIRES_IN=
SALT_ROUNDS=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_HOST=
DB_PORT=
DB_DIALECT=
```

### 3. Run Migrations & Seeders
Review the migrations in `backend/migrations` and seeders in `backend/seeders`, then execute:

```bash
# Run migrations to create tables and indexes
npm run db:migrate

# Seed demo users, riders, deliveries, and payments
npm run db:seed
```

### 4. Start the Application

```bash
# Dev hot-reload mode:
npm run dev:backend

# Or production mode:
npm run start:backend
```
The REST API will be available at `http://localhost:5000`.

---

## Testing & Quality Verification

Run the comprehensive test suite:

```bash
npm run test:backend
```

This executes:
- **Sweep 1:** Platform invariants, admin registration block, pricing formula ($5.00 + $1.50/kg), state machine transitions, rider availability validation, and Sequelize models & associations.
- **Sweep 2:** Security verification, unauthenticated access rejection, role authorization barriers, and database connectivity.

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
- **Try Admin Registration (Must Fail with 400):**
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

- **Register New Rider:**
  - `POST http://localhost:5000/api/auth/register`
  - Body:
    ```json
    {
      "name": "Kazeem Rider",
      "email": "kazeem@test.com",
      "phone": "08055556666",
      "password": "Password@123",
      "role": "RIDER",
      "vehicleType": "MOTORCYCLE",
      "plateNumber": "KJA-890-AA"
    }
    ```
  - Response: `201 Created` with rider profile initialized to `OFFLINE`.

#### 2. Login & Token Retrieval
- **Login Customer:**
  - `POST http://localhost:5000/api/auth/login`
  - Body: `{"email": "customer1@delivery.com", "password": "Customer@123"}`
  - Save `token` as `CUSTOMER_TOKEN`.

- **Login Rider:**
  - `POST http://localhost:5000/api/auth/login`
  - Body: `{"email": "rider1@delivery.com", "password": "Rider@123"}`
  - Save `token` as `RIDER_TOKEN`.

- **Login Admin:**
  - `POST http://localhost:5000/api/auth/login`
  - Body: `{"email": "admin@delivery.com", "password": "Admin@123"}`
  - Save `token` as `ADMIN_TOKEN`.

#### 3. Complete Customer Delivery Flow
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
  - Note: Fee automatically calculated as `$7.25` ($5.00 + 1.5 * $1.50). Status is `PENDING`. Save `id` and `trackingCode`.

- **Process Payment (Simulated Card Payment):**
  - Header: `Authorization: Bearer <CUSTOMER_TOKEN>`
  - `POST http://localhost:5000/api/payments/<id>/pay`
  - Body: `{"paymentMethod": "CARD"}`
  - Note: Payment becomes `SUCCESSFUL`, delivery automatically moves to `CONFIRMED`.

- **Track Progress (Public):**
  - `GET http://localhost:5000/api/deliveries/track/<trackingCode>`
  - Returns current status and full timeline log.

#### 4. Rider Workflow
- **Set Availability to AVAILABLE:**
  - Header: `Authorization: Bearer <RIDER_TOKEN>`
  - `PUT http://localhost:5000/api/riders/availability`
  - Body: `{"availabilityStatus": "AVAILABLE"}`

- **Browse Available Jobs:**
  - Header: `Authorization: Bearer <RIDER_TOKEN>`
  - `GET http://localhost:5000/api/riders/available-jobs`

- **Accept Delivery Job:**
  - Header: `Authorization: Bearer <RIDER_TOKEN>`
  - `POST http://localhost:5000/api/deliveries/<id>/accept`
  - Note: Delivery becomes `ASSIGNED`, rider's availability status automatically becomes `BUSY`.

- **Rider Progresses to PICKED_UP:**
  - Header: `Authorization: Bearer <RIDER_TOKEN>`
  - `PUT http://localhost:5000/api/deliveries/<id>/status`
  - Body: `{"status": "PICKED_UP", "notes": "Picked up from security"}`

- **Rider Progresses to IN_TRANSIT:**
  - Header: `Authorization: Bearer <RIDER_TOKEN>`
  - `PUT http://localhost:5000/api/deliveries/<id>/status`
  - Body: `{"status": "IN_TRANSIT", "notes": "Heading towards Ikoyi"}`

- **Rider Completes Dropoff (DELIVERED):**
  - Header: `Authorization: Bearer <RIDER_TOKEN>`
  - `PUT http://localhost:5000/api/deliveries/<id>/status`
  - Body: `{"status": "DELIVERED", "notes": "Handed to recipient in person"}`
  - Note: Rider availability automatically resets to `AVAILABLE`, total deliveries count incremented.

#### 5. Admin Governance
- **View Dashboard Metrics:**
  - Header: `Authorization: Bearer <ADMIN_TOKEN>`
  - `GET http://localhost:5000/api/admin/overview`

- **Suspend a Malicious User:**
  - Header: `Authorization: Bearer <ADMIN_TOKEN>`
  - `PUT http://localhost:5000/api/admin/users/<userId>/status`
  - Body: `{"status": "SUSPENDED"}`
  - Subsequent requests with this user's token will receive `403 Forbidden`.

- **Dispatch / Assign Rider Manually:**
  - Header: `Authorization: Bearer <ADMIN_TOKEN>`
  - `PUT http://localhost:5000/api/admin/deliveries/<deliveryId>/assign`
  - Body: `{"riderId": 2}`
