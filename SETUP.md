# StepUp - Quick Setup Guide

## Quick Start (Development)

### 1. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings (use nano, vim, or any editor)
# Required: Set MONGODB_URI to your MongoDB connection string

# Start development server
npm run dev
```

The backend will start on `http://localhost:3000`

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 3. Setup Mobile App

```bash
# Navigate to mobile app
cd mobile/stepup_app

# Install Flutter dependencies
flutter pub get

# Update API endpoint
# Edit lib/utils/constants.dart and change baseUrl:
# - For Android Emulator: http://10.0.2.2:3000/api
# - For iOS Simulator: http://localhost:3000/api
# - For Physical Device: http://YOUR_COMPUTER_IP:3000/api

# Run the app
flutter run
```

## Testing the Application

### 1. Create Test Users

**Student Account:**
```
POST http://localhost:3000/api/auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@student.com",
  "password": "password123",
  "role": "student"
}
```

**Professor Account:**
```
POST http://localhost:3000/api/auth/register
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@professor.com",
  "password": "password123",
  "role": "professor"
}
```

### 2. Add Test Data

```
POST http://localhost:3000/api/steps
Authorization: Bearer <your_token>
{
  "date": "2024-01-15",
  "steps": 10000,
  "source": "manual"
}
```

## Common Issues

### Backend Issues

**Issue:** MongoDB connection failed
```
Solution:
1. Check if MongoDB is running
2. Verify MONGODB_URI in .env
3. Check network connectivity (for Atlas)
```

**Issue:** Port 3000 already in use
```
Solution: Change PORT in .env to different port (e.g., 3001)
```

### Mobile App Issues

**Issue:** Cannot connect to backend
```
Solution:
1. Check backend is running
2. Verify API endpoint in constants.dart
3. For Android emulator, use 10.0.2.2 instead of localhost
4. For physical device, ensure same network and use computer IP
```

**Issue:** Flutter dependencies error
```
Solution:
flutter clean
flutter pub get
```

## Environment Variables Reference

### Backend (.env)
```env
PORT=3000                                    # Server port
NODE_ENV=development                         # Environment
MONGODB_URI=mongodb://localhost:27017/stepup # MongoDB connection
JWT_SECRET=your_super_secret_key_here        # JWT secret (change this!)
JWT_EXPIRE=7d                                # Token expiration
CORS_ORIGIN=*                                # CORS allowed origins
```

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Add Steps (requires token)
```bash
curl -X POST http://localhost:3000/api/steps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "date": "2024-01-15T00:00:00.000Z",
    "steps": 12000,
    "source": "manual"
  }'
```

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Use MongoDB Atlas or managed MongoDB
4. Set specific `CORS_ORIGIN` instead of `*`
5. Deploy to platforms like:
   - Heroku
   - DigitalOcean
   - AWS
   - Render

### Mobile App
1. Update API endpoint to production URL
2. Build release versions:
```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release
```
3. Publish to:
   - Google Play Store
   - Apple App Store

## Need Help?

- Check the main README.md for detailed documentation
- Review API endpoints in backend/README.md
- Check mobile app documentation in mobile/stepup_app/README.md
- Open an issue on GitHub

---

Happy coding! 🚀
