# Tasky Project Manager App

## Full Setup Instructions

To run this code, set up the database, and test the platform, please follow these steps:

### 1. Database Setup

You will need to have **MySQL** installed and running locally. The default connection expects the user `root` and password `root`.

Open your terminal and run the following commands from the root of this project to create the database, build the schema, and insert the test data:

```bash
# 1. Create the database
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS tasky;"

# 2. Import the database schema (tables, views, procedures)
mysql -u root -proot tasky < tasky_schema.sql

# 3. Import the seed data (test users, projects, tasks)
mysql -u root -proot tasky < server/seed_data.sql
```

### 2. Start the Backend Server

The backend is a Node.js Express server located in the `server` folder.

```bash
cd server
npm install
npm run dev
```

_The server will start running on http://localhost:3001_

### 3. Start the Frontend Application

The frontend is a Quasar Vue.js application. Open a **new terminal tab** in the root project folder:

```bash
npm install
npm run dev
```

_The application will start running on http://localhost:9000_

### 4. Test Accounts

Once the app is running, you can log in using the seed data credentials:

**Project Manager Account:**

- **Email:** `pm@tasky.com` (or ID: `PM-001`)
- **Password:** `password123`

**Employee Accounts:**

- **Email:** `sarah.j@tasky.com` (or ID: `EMP-001`)
- **Password:** `password123`
  _(All seeded employees use `password123`)_

---

### Additional Quasar Commands

- **Format & Lint:** `npm run lint`
- **Build for Production:** `quasar build`
