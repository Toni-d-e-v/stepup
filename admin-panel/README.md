# StepUp Admin Panel

Modern React-based admin panel for managing the StepUp fitness tracking platform.

## Features

### Dashboard
- **Overview Statistics**: Total users, active users, groups, and cumulative steps
- **Daily Trends**: Visual charts showing daily step trends and active users
- **Top Performers**: Weekly leaderboard of most active users
- **Recent Activity**: Latest user registrations

### User Management
- View all users with pagination and filtering
- Search users by name or email
- Filter by role (student, professor, admin)
- Edit user details (name, email, role, step goal)
- Delete users
- View detailed user statistics

### Group Management
- Create custom groups
- **Auto-Generate Groups**:
  - Multiple class groups (Class 1, Class 2, etc.)
  - Generation groups (all students or professors of a generation)
  - "All Students" or "All Professors" groups
- View group members and total steps
- Delete groups
- Visual cards with member count and statistics

### Challenge Management
- Create new challenges (daily, weekly, monthly)
- Set target steps and rewards
- Track challenge status (upcoming, active, completed)
- Update challenge progress automatically
- View participant count
- Delete challenges

### Statistics & Reports
- System-wide statistics by period (daily, weekly, monthly, yearly)
- Steps breakdown by role
- Goal achievement rates
- Top performing groups
- **Data Export**: Export users, steps, groups, and challenges as JSON

## Tech Stack

- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - API communication
- **Vite** - Build tool
- **date-fns** - Date formatting

## Setup

### Prerequisites
- Node.js 16+
- StepUp backend running on port 3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3001`

### Production Build

```bash
npm run build
```

## First Time Setup

### Create Admin User

You need to create an admin user before you can login. Use the backend API or MongoDB:

**Option 1: Using backend API (modify role after registration)**

```bash
# 1. Register a normal user via API
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@stepup.com",
    "password": "admin123",
    "role": "student"
  }'

# 2. Manually update role in MongoDB
# Connect to MongoDB and update the user role to "admin"
```

**Option 2: Using MongoDB directly**

```javascript
// Connect to MongoDB
use stepup

// Create admin user with hashed password
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@stepup.com",
  password: "$2a$10$YourHashedPasswordHere", // Hash "admin123" using bcrypt
  role: "admin",
  dailyStepGoal: 10000,
  totalSteps: 0,
  totalPoints: 0,
  groups: [],
  badges: [],
  createdAt: new Date()
})
```

**Option 3: Using the seed script** (recommended)

```bash
cd backend
node scripts/createAdmin.js
```

## Default Login (after setup)

```
Email: admin@stepup.com
Password: admin123
```

**⚠️ IMPORTANT**: Change the default admin password immediately after first login!

## Features Guide

### Generating Groups

The admin panel includes a powerful group generation feature:

1. Navigate to **Groups** page
2. Click **"Generate Groups"** button
3. Choose generation type:
   - **Multiple Classes**: Creates numbered class groups (e.g., Class 1, Class 2, ...)
   - **Generation Group**: Creates a group for all students or professors
   - **All Students/Professors**: Creates a single group with all users of that role

Example use cases:
- Create 10 class groups for a new school year
- Generate "Freshmen 2024" group with all first-year students
- Create "All Professors" group for faculty challenges

### Managing Challenges

1. Navigate to **Challenges** page
2. Click **"Create Challenge"**
3. Fill in details:
   - Title and description
   - Type (daily, weekly, monthly)
   - Target steps
   - Start and end dates
   - Reward points and badge

The challenge status is automatically determined based on dates:
- **Upcoming**: Start date in the future
- **Active**: Currently running
- **Completed**: End date passed

Update progress manually using the refresh icon to recalculate participant steps.

### Exporting Data

Navigate to **Statistics** page and use the export buttons:
- **Export Users**: All user data with profiles
- **Export Steps**: Complete step history
- **Export Groups**: Group data with members
- **Export Challenges**: All challenges with participants

Data is exported as JSON files for analysis or backup.

## API Integration

The admin panel communicates with the StepUp backend API at `/api/admin/*` endpoints:

- `/api/admin/dashboard` - Dashboard statistics
- `/api/admin/users` - User management
- `/api/admin/groups` - Group management
- `/api/admin/challenges` - Challenge management
- `/api/admin/statistics` - System statistics
- `/api/admin/export/:type` - Data export

All requests require admin authentication via JWT token.

## Development

### Project Structure

```
admin-panel/
├── src/
│   ├── components/     # Reusable components (Layout, etc.)
│   ├── pages/          # Main pages (Dashboard, Users, etc.)
│   ├── services/       # API service layer
│   ├── contexts/       # React contexts (Auth)
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
└── package.json
```

### Adding New Features

1. Create new page in `src/pages/`
2. Add route in `src/App.jsx`
3. Add menu item in `src/components/Layout.jsx`
4. Add API methods in `src/services/api.js`

## Security

- All admin routes require authentication
- JWT tokens are stored in localStorage
- Automatic logout on 401 responses
- CORS configured for security
- Only users with `role: "admin"` can access

## Troubleshooting

**Cannot login**
- Ensure you've created an admin user (see "First Time Setup")
- Verify the user has `role: "admin"` in the database
- Check backend is running on port 3000

**API errors**
- Verify backend is running
- Check proxy configuration in `vite.config.js`
- Ensure CORS is properly configured in backend

**Groups not generating**
- Ensure users exist in the system
- Check user roles match generation criteria
- Verify backend API is accessible

## License

MIT License

---

**Note**: This is an admin panel with sensitive operations. Ensure proper security measures are in place before deploying to production.
