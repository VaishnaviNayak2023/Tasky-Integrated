# TASKY-PROJECT-ADMIN - Complete Running Guide

This guide provides comprehensive instructions for running the complete TASKY-PROJECT-admin application, including frontend, backend, and database setup.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v22.12 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/) ⚠️ **REQUIRED**
- **npm** or **pnpm** (package manager)
- **Git** (optional, for version control)

## 🏗️ Project Structure

```
tasky-project/
├── TASKY-PROJECT-admin/    # Admin Frontend (Quasar Vue.js) - Port 9000
├── employee 2/employee/     # Employee Frontend (Quasar Vue.js) - Port 9004
├── server/                  # Main Backend (Express.js) - Port 3001
├── tasky_schema.sql         # Main database schema
└── auth/                    # Authentication components
```

## 🚀 Quick Start Guide

### Step 1: Database Setup (REQUIRED)

#### 1.1 Install and Start MySQL

1. Download MySQL Community Server from https://dev.mysql.com/downloads/mysql/
2. Install MySQL with default settings
3. Set a root password during installation (remember it!)
4. Start MySQL service:
   - Windows: Open Services (Win+R, type `services.msc`), find "MySQL80" and start it
   - Or use command: `net start MySQL80`

#### 1.2 Create Database and Import Schema

Navigate to the project root directory (`tasky-project/`):

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS tasky;"

# Import the main database schema
mysql -u root -p tasky < tasky_schema.sql
```

**Note:** You will be prompted for your MySQL root password.

### Step 2: Install Dependencies

#### 2.1 Install Admin Frontend Dependencies

```bash
cd TASKY-PROJECT-admin
npm install
cd ..
```

#### 2.2 Install Employee Frontend Dependencies

```bash
cd "employee 2/employee"
npm install
cd ../..
```

#### 2.3 Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### Step 3: Configure Database Connection

The backend uses default configuration in `server/db.config.js`. Update if your MySQL setup differs:

```javascript
{
  host: '127.0.0.1',
  user: 'root',
  password: '', // Change to your MySQL root password
  database: 'tasky',
  port: 3306
}
```

### Step 4: Start the Application

#### 4.1 Start Backend Server (REQUIRED)

Open a terminal and run:

```bash
cd server
npm start
```

The server will start on: `http://localhost:3001`

**Important:** The backend MUST be running for the frontend to work. You will see "Failed to fetch" errors if the backend is not running.

#### 4.2 Start Admin Frontend

Open a new terminal and run:

```bash
cd TASKY-PROJECT-admin
npm run dev
```

The frontend will start on: `http://localhost:9000`

#### 4.3 Start Employee Frontend (Optional)

Open a new terminal and run:

```bash
cd "employee 2/employee"
npm run dev
```

The employee frontend will start on: `http://localhost:9004`

## 🔐 Test Accounts

Once all services are running, you can log in using these test credentials:

### Project Manager Account
- **Email:** `pm@tasky.com`
- **Employee ID:** `PM-001`
- **Password:** `password123`

### Employee Accounts
- **Email:** `sarah.j@tasky.com` (ID: `EMP-001`)
- **Email:** `mike.r@tasky.com` (ID: `EMP-002`)
- **Email:** `emma.l@tasky.com` (ID: `EMP-003`)
- **Password:** `password123` (all employees use the same password)

## 🌐 Access Points

- **Frontend Application:** http://localhost:9000
- **Main Backend API:** http://localhost:3001
- **Performance Backend API:** http://localhost:4000
- **Database:** MySQL on localhost:3306

## 📱 Available Features

### For Project Managers:
- Project CRUD operations
- Task management with dependencies
- Resource assignment and scheduling
- Team management
- Project analytics dashboard
- Resource workload monitoring
- Deadline risk tracking

### For Employees:
- Personal dashboard
- Task assignment and tracking
- Daily work logging
- Progress updates
- Peer review system
- Performance analytics
- Calendar/planner view

## 🔧 Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Format and lint code
npm run lint:check   # Check code formatting
npm run typecheck    # Run TypeScript type checking
```

### Main Backend (server/)
```bash
npm start            # Start production server
npm run dev          # Start development server with auto-reload
```

### Performance Backend (backend/)
```bash
npm start            # Start production server
npm run dev          # Start development server with auto-reload
```

## 🐛 Troubleshooting

### ⚠️ CRITICAL: MySQL Database Required

**Problem:** `Failed to fetch` error when trying to create account or sign in

**Root Cause:** The backend servers require MySQL to be running. Without MySQL, the frontend cannot connect to the backend API.

**Solution:** You MUST install and start MySQL before the application will work:

1. **Install MySQL:**
   - Download MySQL Community Server from https://dev.mysql.com/downloads/mysql/
   - During installation, set root password (remember it!)
   - Install MySQL Workbench for easier management

2. **Start MySQL Service:**
   - Windows: Open Services (Win+R, type `services.msc`), find "MySQL80" and start it
   - Or use command: `net start MySQL80`

3. **Create Database:**
   ```bash
   mysql -u root -p
   # Enter your password when prompted
   CREATE DATABASE tasky;
   EXIT;
   ```

4. **Import Schema:**
   ```bash
   mysql -u root -p tasky < tasky_schema.sql
   ```

5. **Verify MySQL is running:**
   ```bash
   netstat -ano | findstr :3306
   ```

**Without MySQL, the application will NOT work.** The frontend will show "Failed to fetch" errors because the backend cannot authenticate users or store data.

### Database Connection Issues

**Problem:** `ECONNREFUSED 127.0.0.1:3306`

**Solutions:**
1. Ensure MySQL service is running (see above)
2. Check MySQL credentials in `server/db.config.js`
3. Verify database name matches (`tasky`)
4. Check if MySQL is listening on port 3306

### Port Already in Use

**Problem:** Port 3001, 4000, or 9000 already in use

**Solutions:**
1. Kill the process using the port:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```
2. Or change the port in the respective `.env` file

### Frontend Build Errors

**Problem:** TypeScript or linting errors during build

**Solutions:**
1. Run `npm run lint` to fix formatting issues
2. Run `npm run typecheck` to identify TypeScript errors
3. Check console for specific error messages

### Backend Dependencies Issues

**Problem:** `npm install` fails

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check Node.js version (requires v22.12+)

## 📝 Architecture Notes

### Frontend (Quasar Vue.js)
- Built with Vue 3, TypeScript, and Quasar Framework
- Uses Pinia for state management
- Follows container/composable pattern for clean architecture
- Responsive design with mobile support

### Main Backend (Express.js)
- RESTful API with JWT authentication
- RBAC (Role-Based Access Control)
- MySQL database with connection pooling
- CORS enabled for frontend communication

### Performance Backend (Express.js)
- Dedicated analytics and reporting module
- Advanced filtering capabilities
- Export functionality (PDF, Excel, CSV)
- AI-powered insights generation

### Database (MySQL)
- Complete schema with relationships
- Views for performance optimization
- Stored procedures for complex operations
- Seed data for testing

## 🔒 Security Notes

- **Default credentials** are for development only
- Change `JWT_SECRET` in production
- Use strong database passwords in production
- Enable SSL/HTTPS in production
- Implement rate limiting for API endpoints
- Regular security updates for dependencies

## 📦 Production Deployment

### Building for Production

```bash
# Build frontend
npm run build

# The build output will be in the `dist/spa` folder
```

### Environment Setup for Production

1. Set production environment variables
2. Use a production MySQL instance
3. Configure SSL certificates
4. Set up process managers (PM2, systemd)
5. Configure reverse proxy (Nginx)
6. Enable CORS for production domain

## 📚 Additional Resources

- **Quasar Documentation:** https://quasar.dev
- **Vue.js Documentation:** https://vuejs.org
- **Express.js Documentation:** https://expressjs.com
- **MySQL Documentation:** https://dev.mysql.com/doc

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the project README.md
3. Check the PERFORMANCE_MODULE_IMPLEMENTATION.md for advanced features
4. Review the project_synopsis.md for architecture details

---

**Note:** This guide assumes you're running the application locally for development. For production deployment, additional security and configuration steps are required.
