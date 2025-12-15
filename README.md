# Employee Leave Management System

A full-stack web application for managing employee leave requests with role-based access control.

## Features

### Employee
- Register and login to the system
- Apply for leave with start date, end date, and reason
- View leave history and status

### Admin
- View all leave requests
- Approve or reject pending requests with optional comments
- Filter requests by status (pending, approved, rejected)
- Audit logging for all admin actions

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Frontend | React.js (Vite) |
| Styling | Tailwind CSS |
| Authentication | JWT |
| Password Security | bcrypt |

## Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service calls
│   │   └── ...
│   └── ...
├── server/                 # Node.js Backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth & validation middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── utils/              # Helper functions
│   └── index.js            # Server entry point
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ishanrukshan/-Employee-Leave-Management-System.git
   cd -Employee-Leave-Management-System
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `server` folder:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/leave-management
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

4. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

5. **Create frontend `.env` file**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:5000`

3. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Leave Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/leaves` | Apply for leave | Employee |
| GET | `/api/leaves` | Get user's leaves | Employee |
| GET | `/api/leaves/all` | Get all leaves | Admin |
| PUT | `/api/leaves/:id/approve` | Approve leave | Admin |
| PUT | `/api/leaves/:id/reject` | Reject leave | Admin |

## Creating an Admin User

To create an admin user, you can use the register endpoint with the role field:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Or directly in MongoDB:
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "<bcrypt-hashed-password>",
  role: "admin"
})
```

## License

ISC
