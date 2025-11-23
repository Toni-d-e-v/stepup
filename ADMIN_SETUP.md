# StepUp - Admin System Setup Guide

This guide explains how to set up the admin hierarchy system with SuperAdmins and SchoolAdmins.

## Role Hierarchy

```
SuperAdmin (System Administrator)
    ├── Creates and manages schools
    ├── Creates and manages school admins
    └── Full system access

SchoolAdmin (School Professors/Admins)
    ├── Manages users in their assigned school
    ├── Creates and manages groups for their school
    └── Views school statistics and leaderboards

User (Students/Teachers)
    ├── Uses mobile app only
    ├── Tracks steps automatically
    └── Competes in groups assigned by school admin
```

## 1. Create Your First SuperAdmin

### Step 1: Generate Password Hash

```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourSecurePassword123!', 10));"
```

Copy the output (it will look like: `$2a$10$AbCdEfGh...`)

### Step 2: Insert SuperAdmin into MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to your cluster → **Browse Collections**
3. Select your database (e.g., `stepup`)
4. Click on the `users` collection
5. Click **Insert Document**
6. Switch to **JSON View** and paste:

```json
{
  "email": "admin@yourschool.com",
  "password": "$2a$10$PASTE_YOUR_HASH_HERE",
  "firstName": "Super",
  "lastName": "Admin",
  "role": "superAdmin",
  "school": null,
  "totalSteps": 0,
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

7. Replace `$2a$10$PASTE_YOUR_HASH_HERE` with your generated hash
8. Click **Insert**

## 2. Login to Admin Panel

1. Start the backend:
   ```bash
   cd backend
   npm start
   ```

2. Start the admin panel:
   ```bash
   cd admin-panel
   npm start
   ```

3. Open browser: `http://localhost:5173`

4. Login with:
   - Email: `admin@yourschool.com`
   - Password: `YourSecurePassword123!`

## 3. Create Schools (SuperAdmin Only)

As a SuperAdmin, you can create schools:

1. Navigate to **Schools** in the sidebar
2. Click **Add School**
3. Fill in:
   - **School Name**: e.g., "Lincoln High School"
   - **Address**: e.g., "123 Main St"
   - **City**: e.g., "Springfield"
   - **Country**: e.g., "USA"
4. Click **Save**

## 4. Create SchoolAdmins (SuperAdmin Only)

1. Navigate to **School Admins**
2. Click **Create School Admin**
3. Fill in:
   - **First Name**: Professor's first name
   - **Last Name**: Professor's last name
   - **Email**: Professor's email
   - **Password**: Temporary password (they should change it)
   - **School**: Select from dropdown
4. Click **Create**

The SchoolAdmin can now login to the admin panel and manage their school.

## 5. SchoolAdmin Workflow

### Login as SchoolAdmin

SchoolAdmins use the same admin panel URL but see different options based on their role.

### Manage Users

1. Navigate to **Users**
2. View all registered users from your school
3. See their step counts and activity

### Create Groups

1. Navigate to **Groups**
2. Click **Create Group**
3. Fill in:
   - **Group Name**: e.g., "Class 3-A" or "Class of 2024"
   - **Type**: Select from:
     - **School**: Whole school
     - **Generation**: e.g., graduating year
     - **Class**: e.g., specific class/grade
     - **Custom**: Any custom grouping
   - **Description**: Optional
4. Click **Create**

### Add Users to Groups

1. Go to a group's detail page
2. Click **Add Members**
3. Select users from the list
4. Click **Add to Group**

## 6. Mobile App User Flow

### Registration

Users register via the mobile app with just:
- Full Name
- Email
- Password
- School (dropdown selection)

**No role selection** - everyone is a regular user by default.

### Waiting for Groups

After registration, users will see:
- Dashboard with their step tracking
- **"No groups yet"** message on Groups screen
- Instructions to wait for their school admin

### After Being Added to Groups

Once a SchoolAdmin adds them to groups:
- Groups appear automatically in the app
- They can compete in leaderboards
- They see their ranking within groups

## 7. Quick Reference Commands

### Create SuperAdmin Password Hash
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('PASSWORD', 10));"
```

### MongoDB Query to Check Users
```javascript
db.users.find({ role: "superAdmin" })
db.users.find({ role: "schoolAdmin" })
db.users.find({ role: "user" })
```

### MongoDB Query to List Schools
```javascript
db.schools.find()
```

## 8. Security Best Practices

⚠️ **Important Security Notes:**

1. **Change Default Passwords**
   - Change superAdmin password after first login
   - Force schoolAdmins to change temporary passwords

2. **Strong Passwords**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols

3. **Access Control**
   - Only give superAdmin access to trusted administrators
   - Give schoolAdmin access only to teachers/professors

4. **Environment Variables**
   - Keep `JWT_SECRET` secret and strong
   - Don't commit `.env` files to git

5. **HTTPS in Production**
   - Use HTTPS for admin panel
   - Use secure WebSocket connections

## 9. Troubleshooting

### Can't Login as SuperAdmin
- Verify email and password are correct
- Check password hash was copied correctly
- Ensure MongoDB is running and connected
- Check `users` collection in MongoDB Atlas

### SchoolAdmin Can't See Users
- Verify schoolAdmin's `school` field matches a school ID
- Check that users have registered with that school
- Refresh the browser

### Mobile Users Can't Select School
- Ensure schools are created in the database
- Check API endpoint is accessible
- Verify backend is returning schools list

### Groups Not Showing in Mobile App
- Verify user is added to the group
- Check user's groups in MongoDB
- Ensure mobile app is calling the correct API

## 10. Database Schema Reference

### User Document
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password": "hashed_password",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user|schoolAdmin|superAdmin",
  "school": "ObjectId or null",
  "totalSteps": 0,
  "createdAt": "Date"
}
```

### School Document
```json
{
  "_id": "ObjectId",
  "name": "School Name",
  "address": "123 Main St",
  "city": "City",
  "country": "Country",
  "schoolAdmins": ["ObjectId"],
  "active": true,
  "createdBy": "ObjectId",
  "createdAt": "Date"
}
```

### Group Document
```json
{
  "_id": "ObjectId",
  "name": "Group Name",
  "description": "Optional description",
  "type": "school|generation|class|custom",
  "school": "ObjectId",
  "members": ["ObjectId"],
  "createdBy": "ObjectId",
  "createdAt": "Date"
}
```

---

## Need Help?

If you encounter issues:
1. Check this guide thoroughly
2. Verify MongoDB connection
3. Check browser console for errors
4. Check backend server logs
5. Ensure all services are running

**Happy Managing! 🎓**
