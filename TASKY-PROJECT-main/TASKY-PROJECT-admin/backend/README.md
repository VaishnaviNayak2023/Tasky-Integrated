# Tasky manager API

The API is an Express/MySQL service for manager workflows. It expects the schema in `../tasky_schema.sql` to be loaded first.

## Run

```powershell
cd backend
npm install
$env:DB_HOST = '127.0.0.1'
$env:DB_USER = 'root'
$env:DB_PASSWORD = 'your-password'
$env:DB_NAME = 'tasky'
$env:JWT_SECRET = 'replace-me'
npm start
```

Endpoints include `POST /api/auth/login`, `GET /api/manager/dashboard`, `GET /api/projects`, `GET /api/tasks`, `GET /api/resources`, `POST /api/invites`, and `POST /api/invites/redeem`.

Project health is calculated from task progress against elapsed schedule time, with recent work-log activity as a confidence signal. A completed project is `Completed`; increasing pace gaps produce `Slightly Delayed`, `At Risk`, or `Severely Delayed`.
