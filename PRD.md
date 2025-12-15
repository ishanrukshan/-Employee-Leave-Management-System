# Product Requirements Document (PRD)
## Employee Leave Management System

---

## 1. Introduction

### 1.1 Project Overview
| Field | Details |
|-------|---------|
| **Project Name** | Employee Leave Management System |
| **Version** | 1.0 |
| **Date** | December 15, 2025 |
| **Repository** | -Employee-Leave-Management-System |

### 1.2 Objective
Develop a web application where employees can request leave and administrators can approve or reject them.

### 1.3 Primary Focus
The assignment prioritizes:
- ✅ Backend Architecture
- ✅ Authentication
- ✅ Business Logic

---

## 2. Technical Architecture

### 2.1 Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Frontend** | React.js (Vite) |
| **Styling** | Tailwind CSS |
| **Authentication** | JWT (JSON Web Token) |
| **Password Security** | bcrypt |

### 2.2 Project Structure
```
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth context
│   │   ├── services/       # API service calls
│   │   └── utils/          # Helper functions
│   └── ...
├── server/                 # Node.js Backend
│   ├── controllers/        # Request handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & validation middleware
│   ├── utils/              # Helper functions
│   └── config/             # Database & environment config
└── README.md
```

### 2.3 Security & Authentication

| Feature | Implementation |
|---------|----------------|
| Authentication | JWT-based token authentication |
| Password Storage | Hashed using bcrypt |
| Protected Routes | Middleware-based route protection |
| Role-based Access | Admin/Employee role verification |

---

## 3. User Roles & Authorization

### 3.1 Employee Role

| Permission | Description |
|------------|-------------|
| Apply for Leave | Submit new leave requests with start date, end date, and reason |
| View Leave History | View their own past leave requests and statuses |

### 3.2 Admin Role

| Permission | Description |
|------------|-------------|
| View All Requests | See all leave requests from all employees |
| Approve Leave | Approve pending leave requests |
| Reject Leave | Reject pending leave requests with optional reason |

---

## 4. Functional Requirements

### 4.1 Backend Business Logic (High Priority)

#### 4.1.1 Core Features

| Feature | Requirement | Priority |
|---------|-------------|----------|
| Date Validation | End Date must not be before Start Date | High |
| Day Calculation | Auto-calculate total days from start/end dates | High |
| Leave Status | Track status: Pending, Approved, Rejected | High |

#### 4.1.2 Bonus Features

| Feature | Requirement | Priority |
|---------|-------------|----------|
| Input Validation | Use express-validator middleware | Medium |
| Audit Logging | Log admin actions (e.g., "Admin X approved leave Y at [Time]") | Medium |

### 4.2 API Endpoints

#### Authentication Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/me` | Get current user | Protected |

#### Leave Routes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/leaves` | Apply for leave | Employee |
| GET | `/api/leaves` | Get user's leaves | Employee |
| GET | `/api/leaves/all` | Get all leaves | Admin |
| PUT | `/api/leaves/:id/approve` | Approve leave | Admin |
| PUT | `/api/leaves/:id/reject` | Reject leave | Admin |

---

## 5. Data Models

### 5.1 User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['employee', 'admin'], default: 'employee'),
  createdAt: Date,
  updatedAt: Date
}
```

### 5.2 Leave Model

```javascript
{
  _id: ObjectId,
  employee: ObjectId (ref: User, required),
  startDate: Date (required),
  endDate: Date (required),
  totalDays: Number (auto-calculated),
  reason: String (required),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  adminComment: String (optional),
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5.3 Audit Log Model (Bonus)

```javascript
{
  _id: ObjectId,
  action: String (required),
  performedBy: ObjectId (ref: User, required),
  targetLeave: ObjectId (ref: Leave),
  details: String,
  timestamp: Date (default: Date.now)
}
```

---

## 6. Frontend Requirements

### 6.1 Pages & Components

#### 6.1.1 Public Pages

| Page | Components | Description |
|------|------------|-------------|
| Login | LoginForm | Email/password input form |
| Register | RegisterForm | Name/email/password registration |

#### 6.1.2 Employee Dashboard

| Component | Description |
|-----------|-------------|
| ApplyLeaveButton | Button to open leave application form |
| LeaveApplicationForm | Form with start date, end date, reason fields |
| LeaveHistoryTable | Table showing user's past leave requests |
| StatusBadge | Visual indicator for leave status (pending/approved/rejected) |

#### 6.1.3 Admin Dashboard

| Component | Description |
|-----------|-------------|
| PendingRequestsTable | Table of all pending leave requests |
| AllRequestsTable | Table of all leave requests with filters |
| ApproveButton | Button to approve a leave request |
| RejectButton | Button to reject a leave request |
| ActionModal | Confirmation modal for approve/reject actions |

### 6.2 UI/UX Guidelines

| Aspect | Requirement |
|--------|-------------|
| Design Focus | Functionality over aesthetics |
| Framework | Tailwind CSS utility classes |
| Responsiveness | Basic mobile responsiveness |
| Data Display | Clean, readable tables |
| Feedback | Toast notifications for actions |

---

## 7. Validation Rules

### 7.1 User Registration

| Field | Validation |
|-------|------------|
| Name | Required, min 2 characters |
| Email | Required, valid email format, unique |
| Password | Required, min 6 characters |

### 7.2 Leave Application

| Field | Validation |
|-------|------------|
| Start Date | Required, cannot be in the past |
| End Date | Required, must be >= Start Date |
| Reason | Required, min 10 characters |

---

## 8. Business Logic Details

### 8.1 Total Days Calculation

```javascript
// Calculate total days including both start and end dates
totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
```

### 8.2 Leave Status Flow

```
[New Request] → PENDING → APPROVED
                       ↘ REJECTED
```

### 8.3 Audit Log Format

```
"Admin {adminName} {action} leave request #{leaveId} at {timestamp}"
```

Example:
```
"Admin John Doe approved leave request #507f1f77bcf86cd799439011 at 2025-12-15T10:30:00Z"
```

---

## 9. Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/leave-management

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Client
VITE_API_URL=http://localhost:5000/api
```

---

## 10. Development Milestones

### Phase 1: Backend Setup (Priority: High)
- [ ] Initialize Express.js server
- [ ] Configure MongoDB connection
- [ ] Create User and Leave models
- [ ] Implement JWT authentication
- [ ] Set up bcrypt password hashing

### Phase 2: API Development (Priority: High)
- [ ] Create auth routes (register, login)
- [ ] Create leave routes (CRUD operations)
- [ ] Implement role-based middleware
- [ ] Add date validation logic
- [ ] Implement total days calculation

### Phase 3: Frontend Development (Priority: Medium)
- [ ] Set up React Router
- [ ] Create authentication context
- [ ] Build login/register pages
- [ ] Create employee dashboard
- [ ] Create admin dashboard

### Phase 4: Integration & Testing (Priority: Medium)
- [ ] Connect frontend to backend APIs
- [ ] Test all user flows
- [ ] Handle error states
- [ ] Add loading states

### Phase 5: Bonus Features (Priority: Low)
- [ ] Add express-validator middleware
- [ ] Implement audit logging
- [ ] Add notifications/toasts
- [ ] Improve error handling

---

## 11. Success Criteria

| Criteria | Requirement |
|----------|-------------|
| Authentication | Users can register, login, and maintain sessions |
| Role Separation | Employees and Admins have distinct capabilities |
| Leave Application | Employees can successfully apply for leave |
| Leave Approval | Admins can approve/reject leave requests |
| Data Validation | Invalid data is rejected with appropriate errors |
| Date Logic | Total days calculated correctly |

---

## 12. Out of Scope (v1.0)

- Email notifications
- Leave balance tracking
- Multiple leave types (sick, vacation, etc.)
- Calendar view
- Export to PDF/Excel
- Multi-tenancy
- Advanced reporting/analytics

---

## 13. References

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [JWT.io](https://jwt.io/)
