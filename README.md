# Shiduchim MVP

A premium system designed for local matchmakers (Shadchanim) to manage candidate profiles, preferences, and matches.

## Project Structure

*   `backend/`: Java 21 + Spring Boot 3.5.x + Spring Data JPA + MySQL
*   `mobile/`: React Native + Expo + TypeScript
*   `docs/`: Core architecture, API contracts, decisions, and plan documents

---

## Prerequisites

Ensure you have the following installed locally:
1. Java Development Kit (JDK) 21
2. Node.js (v18 or higher) and npm
3. Docker and Docker Compose
4. Maven (optional, wrapper `./mvnw` is included in backend)

---

## Quick Start Instructions

### 1. Database Setup
Start the local MySQL database using Docker Compose:
```bash
docker compose up -d
```
> [!IMPORTANT]
> The Docker Desktop daemon must be running on your host machine for the command to succeed. The backend requires this local MySQL database to be active in order to boot successfully.

This spins up a MySQL container named `shiduchim_mysql` listening on port `3306`.
*   **Database:** `shiduchim`
*   **User:** `shiduchim_user`
*   **Password:** `shiduchim_password`

To stop the database:
```bash
docker compose down
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build the project:
   ```bash
   ./mvnw clean package -DskipTests
   ```
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```
The backend server runs locally on `http://localhost:8080`.

### 3. Mobile Setup
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```
Use the Expo Go app or an emulator to run the application.
