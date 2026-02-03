# RegionStat - Developer Guide

This project is a Fullstack Web Application for Regional Reports Monitoring.

## Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

## Project Structure
- **backend/**: NestJS API
- **frontend/**: React + Vite Client

## How to Run

### 1. Database Setup
Ensure PostgreSQL is running on localhost:5432.
Create a database named `regionstat` (or change name in `backend/src/database/database.module.ts`).

### 2. Backend
```bash
cd backend
npm install
npm run start:dev
```
The API will start at `http://localhost:3000/api/v1`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
The Client will start at `http://localhost:5173`.

## Features Implemented
- **Modular Monolith Backend**: Users, Organizations, Forms, Submissions modules.
- **Dynamic Form**: Setup for JSON-based form rendering.
- **Workflow**: Draft -> Submitted -> Approved/Rejected flow logic.

## Next Steps
- Implement logic to fetch real Templates from DB (currently Mocked in Frontend).
- Implement real auth (JWT) in Backend `AuthModule`.
