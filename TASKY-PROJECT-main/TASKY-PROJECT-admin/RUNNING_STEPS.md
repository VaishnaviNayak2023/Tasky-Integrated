# Tasky App - Running Instructions

## Prerequisites

1. **Node.js**: Ensure Node.js version 22, 24, or 26 is installed
2. **MySQL**: Ensure MySQL server is running and configured
3. **npm**: Comes with Node.js installation

## Project Structure

The project is organized as follows:
- **TASKY-PROJECT-admin**: Main Quasar Frontend (Vue.js) - Manager & Employee Dashboard
- **TASKY-PROJECT-admin/server**: Backend API (Express.js with MySQL)
- **TASKY-PROJECT-admin/backend**: Additional backend utilities

## Step-by-Step Running Instructions

### 1. Backend Server Setup

#### Navigate to server directory:
```bash
cd "C:\Users\prash\OneDrive\Desktop\PROJECTS\TASKY-PROJECT-main (1)\TASKY-PROJECT-main\TASKY-PROJECT-admin\server"
```

#### Install dependencies (if not already installed):
```bash
npm install
```

#### Configure MySQL Database:
- Ensure MySQL server is running on port 3306
- Import the database schema from `tasky_schema.sql` located in TASKY-PROJECT-admin directory
- Create a database named `tasky_db` (or update the database name in server config)

#### Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:3001`

**Note**: If you see "Database connection failed: Error: connect ECONNREFUSED 127.0.0.1:3306", ensure MySQL is running and accessible on port 3306.

### 2. Frontend Setup

#### Navigate to the admin frontend directory:
```bash
cd "C:\Users\prash\OneDrive\Desktop\PROJECTS\TASKY-PROJECT-main (1)\TASKY-PROJECT-main\TASKY-PROJECT-admin"
```

#### Install dependencies (if not already installed):
```bash
npm install
```

#### Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:9000`

**Note**: The initial compilation may take several minutes. Wait for the compilation to complete before accessing the application.

## Accessing the Application

### Manager Dashboard
- URL: `http://localhost:9000/dashboard`
- Login with project manager credentials

### Employee Dashboard
- URL: `http://localhost:9000/employee/dashboard`
- Login with employee credentials

### Authentication
- The application uses JWT-based authentication
- Tokens are stored in localStorage
- Login/Register pages are at `/auth/login`, `/auth/register/pm`, `/auth/register/employee`

## Features Implemented

### Pass 1 - Bug Fixes (Section A)
- ✅ A1: User/Manager Dashboard search bar and team member profile
- ✅ A2: Projects Section filters, search, forms, and project card detail
- ✅ A3: Tasks Section Create Task server error and search/filters
- ✅ A4: Profile Section NaN% completion rate
- ✅ A5: Notifications panel
- ✅ A6: Employee Dashboard buttons, Create Task, form structure, filters

### Pass 2 - New Features

#### Section B - Manager Dashboard
- ✅ B.1: Smart Task Scheduler
  - Auto-Assign: Automatically assign tasks to suitable team members
  - Rebalance: Suggest task reassignments for overloaded team members
  - Impact Analysis: Analyze the impact of delaying tasks
- ✅ B.2: Daily Consistency Widget
  - Team completion rate tracking
  - Weekly consistency trend visualization
  - Top performers display
- ✅ B.3: AI Insights Panel
  - AI-powered workload insights
  - Deadline risk alerts
  - Efficiency opportunities
  - Quality metrics updates
- ✅ B.4: Performance Dashboard
  - Daily Consistency component
  - Task Quality Metrics (reopened tasks, revision requests, first-time completion)
  - Priority Performance table
  - Achievements & Streaks component

#### Section C - Admin Dashboard
- ✅ Organization page with user management

#### Section D - Employee Dashboard
- ✅ Personal task planner
- ✅ Daily work tracker
- ✅ Task manager enhancements

#### Section E - Cross-cutting Requirements
- ✅ JWT Authentication
  - Token-based authentication
  - Automatic token injection in API requests
  - Token expiration handling
- ✅ Real-time notifications (via notification panel)
- ✅ Export functionality (CSV, XLSX, PDF for performance reports)

## Troubleshooting

### Backend Server Issues

**Server won't start:**
- Check if MySQL is running
- Verify database credentials in server configuration
- Check if port 3001 is available

**Database connection errors:**
- Ensure MySQL service is running
- Verify database name and credentials
- Import schema from `tasky_schema.sql` if not already done

### Frontend Issues

**Compilation errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors in the console
- Verify all dependencies are installed

**API connection errors:**
- Ensure backend server is running on port 3001
- Check CORS configuration in backend
- Verify JWT token is being sent in headers

**Port already in use:**
- Change the port in quasar.config.ts or
- Kill the process using the port

### Development Tips

1. **Hot Reload**: The frontend supports hot reload during development
2. **API Proxy**: The axios configuration is set to proxy requests to `http://localhost:3001/api`
3. **Authentication**: JWT tokens are stored in localStorage and automatically injected into API requests
4. **Single Application**: Both Manager and Employee dashboards are in the same Quasar app, accessed via different routes

## Production Build

To build for production:

```bash
cd "C:\Users\prash\OneDrive\Desktop\PROJECTS\TASKY-PROJECT-main (1)\TASKY-PROJECT-main"
npm run build
```

The built files will be in the `dist` folder.

## Environment Variables

Create a `.env` file in the server directory with the following variables:
```
JWT_SECRET=your_jwt_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tasky_db
PORT=3001
```

## Support

For issues or questions:
- Check the console for error messages
- Verify all services are running (MySQL, Backend, Frontend)
- Review the seed data for correct login credentials
