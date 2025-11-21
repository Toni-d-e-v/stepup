# StepUp Backend API

Backend API for StepUp fitness tracking application built with Express.js and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration.

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Steps
- `POST /api/steps` - Add daily steps
- `GET /api/steps/user/:userId` - Get user's step history
- `GET /api/steps/statistics` - Get user statistics

### Leaderboard
- `GET /api/leaderboard/daily` - Daily leaderboard
- `GET /api/leaderboard/weekly` - Weekly leaderboard
- `GET /api/leaderboard/monthly` - Monthly leaderboard

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create new group
- `POST /api/groups/:id/join` - Join a group

## Technologies

- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
