# StepUp Mobile App

A Flutter mobile application for the StepUp fitness tracking platform.

## Features

- User authentication (students and professors)
- Step tracking with health app integration (Apple Health, Google Fit)
- Daily, weekly, and monthly statistics
- Leaderboards and rankings
- Group management and challenges
- Gamification with badges and achievements

## Getting Started

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Dart SDK
- Android Studio / Xcode for mobile development

### Installation

1. Install dependencies:
```bash
flutter pub get
```

2. Configure the API endpoint in `lib/utils/constants.dart`

3. Run the app:
```bash
flutter run
```

## Project Structure

```
lib/
├── models/          # Data models
├── screens/         # UI screens
├── services/        # API and business logic
├── widgets/         # Reusable widgets
├── utils/           # Utilities and constants
└── main.dart        # App entry point
```

## Platform Setup

### iOS
Add the following to your `Info.plist`:
```xml
<key>NSHealthShareUsageDescription</key>
<string>We need access to your health data to track your steps</string>
<key>NSHealthUpdateUsageDescription</key>
<string>We need access to update your health data</string>
```

### Android
Add permissions to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACTIVITY_RECOGNITION"/>
<uses-permission android:name="android.permission.INTERNET"/>
```

## API Integration

The app connects to the StepUp backend API. Make sure the backend is running before using the app.

Default API URL: `http://localhost:3000/api`
