# StepUp - Fitness Tracking Platform

**StepUp** je edukativno-zabavna aplikacija koja motivira učenike i nastavnike na svakodnevnu tjelesnu aktivnost kroz praćenje koraka i međusobno natjecanje.

## 🎯 Ciljevi projekta

1. Povećati fizičku aktivnost učenika i profesora
2. Razviti zdravu natjecateljsku kulturu kroz grupne izazove
3. Promicati zajedništvo i suradnju kroz timske rezultate
4. Poticati korisnike da postave i dostignu osobne ciljeve u kretanju

## 🚀 Tehnologije

### Backend
- **Express.js** - REST API server
- **MongoDB** - NoSQL baza podataka
- **Mongoose** - ODM za MongoDB
- **JWT** - Autentifikacija
- **bcryptjs** - Hash lozinki

### Frontend (Mobile)
- **Flutter** - Cross-platform mobile framework
- **Dart** - Programski jezik
- **Provider** - State management
- **HTTP/Dio** - API komunikacija

## 📱 Funkcionalnosti

### MVP (Faza 1) - ✅ Implementirano
- ✅ Korisnički profili (učenici i profesori)
- ✅ Autentifikacija (registracija i prijava)
- ✅ Praćenje koraka (ručni unos)
- ✅ Dnevne, tjedne i mjesečne statistike
- ✅ Rang liste (dnevne, tjedne, mjesečne)
- ✅ Grupe i grupne rang liste
- ✅ Postavljanje dnevnih ciljeva

### Faza 2 - Gamifikacija (Planirano)
- 🔲 Bedževi i medalje
- 🔲 Push notifikacije
- 🔲 Vizualni prikazi statistika (grafovi)
- 🔲 Milestone achievements

### Faza 3 - Društveni elementi (Planirano)
- 🔲 Komentari i podrška
- 🔲 Timski izazovi
- 🔲 Integracija sa školskim natjecanjima
- 🔲 Integracija s Apple Health i Google Fit

## 🏗️ Struktura projekta

```
stepup/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Konfiguracija (DB, env)
│   │   ├── controllers/    # Kontroleri za logiku
│   │   ├── middleware/     # Middleware (auth, error handling)
│   │   ├── models/         # Mongoose modeli
│   │   ├── routes/         # API rute
│   │   ├── utils/          # Pomoćne funkcije
│   │   └── server.js       # Glavni server file
│   ├── package.json
│   └── README.md
│
└── mobile/                  # Flutter mobilna aplikacija
    └── stepup_app/
        ├── lib/
        │   ├── models/      # Data modeli
        │   ├── screens/     # UI ekrani
        │   ├── services/    # API servisi
        │   ├── widgets/     # Reusable widgeti
        │   ├── utils/       # Konstante i utiliti
        │   └── main.dart    # App entry point
        ├── pubspec.yaml
        └── README.md
```

## 🔧 Setup i instalacija

### Preduvjeti
- Node.js (v16+)
- MongoDB (lokalno ili cloud - MongoDB Atlas)
- Flutter SDK (3.0.0+)
- Android Studio / Xcode za razvoj mobilnih aplikacija

### Backend Setup

1. Navigirajte u backend direktorij:
```bash
cd backend
```

2. Instalirajte dependencies:
```bash
npm install
```

3. Kreirajte `.env` file:
```bash
cp .env.example .env
```

4. Uredite `.env` sa svojim postavkama:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stepup
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=*
```

5. Pokrenite server:
```bash
# Development
npm run dev

# Production
npm start
```

Server će biti dostupan na `http://localhost:3000`

### Mobile App Setup

1. Navigirajte u mobile direktorij:
```bash
cd mobile/stepup_app
```

2. Instalirajte Flutter dependencies:
```bash
flutter pub get
```

3. Konfigurirajte API endpoint u `lib/utils/constants.dart`:
```dart
static const String baseUrl = 'http://YOUR_IP:3000/api';
```
**Napomena:** Za Android emulator koristite `http://10.0.2.2:3000/api`, za iOS simulator `http://localhost:3000/api`, za fizički uređaj koristite IP adresu računala.

4. Pokrenite aplikaciju:
```bash
# Check connected devices
flutter devices

# Run on specific device
flutter run -d <device_id>

# Run in release mode
flutter run --release
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Registracija novog korisnika
- `POST /api/auth/login` - Prijava korisnika
- `GET /api/auth/me` - Dohvaćanje trenutnog korisnika
- `PUT /api/auth/profile` - Ažuriranje profila

### Steps
- `POST /api/steps` - Dodavanje dnevnih koraka
- `GET /api/steps` - Dohvaćanje povijesti koraka
- `GET /api/steps/statistics` - Dohvaćanje statistike korisnika
- `GET /api/steps/user/:userId` - Dohvaćanje koraka drugog korisnika

### Leaderboard
- `GET /api/leaderboard/daily` - Dnevna rang lista
- `GET /api/leaderboard/weekly` - Tjedna rang lista
- `GET /api/leaderboard/monthly` - Mjesečna rang lista
- `GET /api/leaderboard/myrank` - Trenutna pozicija korisnika

### Groups
- `GET /api/groups` - Dohvaćanje svih grupa
- `POST /api/groups` - Kreiranje nove grupe (samo profesori)
- `GET /api/groups/:id` - Detalji grupe
- `POST /api/groups/:id/join` - Pridruživanje grupi
- `POST /api/groups/:id/leave` - Napuštanje grupe
- `GET /api/groups/:id/leaderboard` - Grupna rang lista

## 🧪 Testiranje

### Backend
```bash
cd backend
npm test
```

### Mobile
```bash
cd mobile/stepup_app
flutter test
```

## 📱 Screenshotovi

(Dodati screenshotove kada aplikacija bude pokrenuta)

## 🤝 Contributing

Ovo je edukativni projekt. Za doprinose:

1. Fork repository
2. Kreirajte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit promjene (`git commit -m 'Add some AmazingFeature'`)
4. Push na branch (`git push origin feature/AmazingFeature`)
5. Otvorite Pull Request

## 📝 Licenca

MIT License

## 👥 Autori

- StepUp Team

## 🙏 Acknowledgments

- Inspired by the need for healthy competition in education
- Built for promoting physical activity among students and teachers

---

**Napomena:** Ovo je MVP verzija aplikacije. Dodatne funkcionalnosti bit će dodane u budućim verzijama prema planu razvoja.
