# StepUp Mobile App (Expo/React Native)

Beautiful, modern fitness tracking app built with Expo and React Native. Features **real automatic step tracking** using your device's pedometer with real-time synchronization.

## 🚀 Features

- ✅ **Automatic Step Tracking** - Real-time step counting using device pedometer (iOS & Android)
- ✅ **Beautiful Material Design UI** - Modern, polished interface with gradients
- ✅ **User Authentication** - Secure login and registration
- ✅ **Live Dashboard** - Real-time stats with daily, weekly, and monthly goals
- ✅ **Leaderboards** - Compete with friends (daily, weekly, monthly)
- ✅ **Groups** - Join school, class, or custom groups
- ✅ **Profile & Achievements** - Track your progress and unlock achievements
- ✅ **Auto-sync** - Steps automatically sync to backend every 100 steps

## 📱 Screenshots

The app includes:
- **Login/Register** screens with gradient backgrounds
- **Dashboard** with step cards and beautiful progress bars
- **Leaderboard** with medal rankings
- **Groups** with search and filtering
- **Profile** with statistics and achievements

## 🛠️ Tech Stack

- **Expo SDK 51** - Latest stable version
- **React Native** - Cross-platform mobile framework
- **TypeScript** - Type-safe development
- **React Navigation** - Bottom tabs + stack navigation
- **React Native Paper** - Material Design components
- **Expo Sensors (Pedometer)** - Real automatic step tracking
- **Axios** - API communication
- **AsyncStorage** - Local data persistence
- **Expo Linear Gradient** - Beautiful gradient effects

## 📋 Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (iOS/Android)
- Backend server running (see `/backend` folder)

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd mobile-expo
npm install
```

### 2. Configure Backend URL

Edit `src/utils/constants.ts` and update the API URL:

```typescript
// If testing on physical device, use your computer's IP
export const API_BASE_URL = 'http://192.168.1.100:3000/api';

// Or if using emulator
export const API_BASE_URL = 'http://localhost:3000/api';
```

**To find your IP:**
- **Windows:** `ipconfig` (look for IPv4 Address)
- **Mac/Linux:** `ifconfig` or `ip addr` (look for inet)

### 3. Start the App

```bash
npm start
```

This will:
1. Start the Expo development server
2. Show a QR code in your terminal
3. Give you options to run on iOS, Android, or web

### 4. Run on Your Device

**Option A: Physical Device (Recommended)**
1. Install **Expo Go** app from App Store or Google Play
2. Scan the QR code with your camera (iOS) or Expo Go app (Android)
3. App will load on your phone!

**Option B: Emulator**
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)

## 📱 Step Tracking

The app automatically tracks your steps using your device's built-in pedometer:

1. **Automatic Detection** - Just walk around with your phone!
2. **Real-time Updates** - See your steps update as you walk
3. **Auto-sync** - Steps sync to backend every 100 steps
4. **Local Storage** - Steps are saved locally and persist across app restarts
5. **Manual Sync** - Tap "Sync Now" button to force immediate sync

**Note:** Automatic step tracking only works on **physical devices** (iOS/Android). Emulators don't have pedometer hardware, so steps won't track.

## 🎨 App Structure

```
mobile-expo/
├── App.tsx                    # Main app entry point
├── src/
│   ├── navigation/            # Navigation setup
│   │   ├── AppNavigator.tsx   # Main app tabs
│   │   └── AuthNavigator.tsx  # Login/Register flow
│   ├── screens/               # All screens
│   │   ├── Auth/              # Login & Register
│   │   ├── Home/              # Dashboard
│   │   ├── Leaderboard/       # Rankings
│   │   ├── Groups/            # Groups & details
│   │   └── Profile/           # User profile
│   ├── components/            # Reusable components
│   │   ├── StepCard.tsx       # Beautiful step display
│   │   ├── LeaderboardItem.tsx
│   │   └── GroupCard.tsx
│   ├── services/              # API & business logic
│   │   ├── api.ts             # HTTP client
│   │   ├── auth.ts            # Authentication
│   │   ├── steps.ts           # Step tracking API
│   │   ├── pedometer.ts       # Real step tracking
│   │   ├── leaderboard.ts
│   │   └── groups.ts
│   ├── context/               # React Context
│   │   └── AuthContext.tsx    # Auth state management
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   └── utils/                 # Constants & helpers
│       └── constants.ts
├── package.json
├── app.json                   # Expo configuration
└── tsconfig.json              # TypeScript config
```

## 🔧 Configuration

### Backend Connection

Update `src/utils/constants.ts`:

```typescript
export const API_BASE_URL = 'http://YOUR_IP:3000/api';
```

### Step Goals

Customize daily goals in `src/utils/constants.ts`:

```typescript
export const STEP_GOALS = {
  daily: 10000,
  weekly: 70000,
  monthly: 300000,
};
```

### Colors/Theme

Customize app colors in `src/utils/constants.ts`:

```typescript
export const COLORS = {
  primary: '#6200ee',
  secondary: '#03dac6',
  // ... more colors
};
```

## 🐛 Troubleshooting

### "Network request failed" error
- Make sure backend is running on `http://localhost:3000`
- Update `API_BASE_URL` with your computer's IP address (find with `ipconfig` or `ifconfig`)
- Check firewall settings

### Steps not tracking
- **Only works on physical devices** - Emulators don't have pedometer hardware
- Grant motion/activity permissions when prompted
- Check Settings > StepUp > Motion & Fitness (iOS)
- Check that app has Activity Recognition permission (Android)

### App won't load
```bash
# Clear cache and restart
npm start --clear
```

### TypeScript errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📦 Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

### Using EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## 🌟 Key Features Explained

### Automatic Step Tracking
- Uses `Pedometer` from `expo-sensors`
- Tracks steps from midnight to now
- Auto-syncs every 100 steps
- Stores locally and on backend
- Works with iOS Core Motion and Android Sensor APIs

### Beautiful UI
- Material Design 3 components
- Gradient backgrounds
- Smooth animations
- Progress bars and charts
- Achievement badges

### Real-time Updates
- Dashboard refreshes every 10 seconds
- Pull-to-refresh on all screens
- Live leaderboard updates
- Instant sync button

## 🔐 Permissions

The app requires:
- **Motion & Fitness** (iOS) - For automatic step tracking
- **Activity Recognition** (Android) - For automatic step tracking
- **Internet** - For API communication with backend server

These permissions are automatically requested on first launch.

## 📄 License

MIT License

## 👨‍💻 Support

For issues or questions:
- Check backend is running: `http://localhost:3000`
- Verify API URL in constants.ts
- Check Expo Go app is latest version
- Review error messages in terminal

---

**Built with ❤️ using Expo and React Native**
