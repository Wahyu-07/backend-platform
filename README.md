# Platform Aspirasi Backend

Backend API untuk Platform Aspirasi - sistem untuk mengelola aspirasi dan feedback dari pengguna.

## 🚀 Fitur

- **Autentikasi & Autorisasi**: JWT-based authentication
- **Manajemen Pengguna**: Registrasi, login, profil pengguna
- **Postingan**: CRUD postingan dengan kategori dan status
- **Interaksi**: Upvote, downvote, dan laporan dengan status
- **Komentar**: Sistem komentar pada postingan
- **Notifikasi**: Sistem notifikasi real-time
- **Status Management**: Kelola status postingan dan interaksi

## 📁 Struktur Proyek

```
platform-aspirasi-backend/
├── config/
│   └── database.js          # Konfigurasi database
├── controllers/             # Logic bisnis aplikasi
│   ├── authController.js
│   ├── penggunaController.js
│   ├── postinganController.js
│   ├── interaksiController.js
│   ├── komentarController.js
│   ├── kategoriController.js
│   └── notifikasiController.js
├── middleware/              # Middleware untuk auth & autorisasi
│   ├── authentikasi.js
│   └── authorisasi.js
├── migrations/              # Database migrations
│   └── add-status-columns.js
├── models/                  # Model database (Sequelize ORM)
│   ├── index.js
│   ├── pengguna.js
│   ├── postingan.js
│   ├── interaksi.js
│   ├── komentar.js
│   ├── kategori.js
│   └── notifikasi.js
├── routes/                  # Endpoint API
│   ├── authRoutes.js
│   ├── penggunaRoutes.js
│   ├── postinganRoutes.js
│   ├── interaksiRoutes.js
│   ├── komentarRoutes.js
│   ├── kategoriRoutes.js
│   └── notifikasiRoutes.js
├── utils/                   # Helper functions
│   ├── jwt.js
│   └── waktu.js
├── .env.example            # Template environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies dan scripts
└── server.js               # Entry point aplikasi
```

## 🛠️ Setup Development

### Prerequisites
- Node.js (v14 atau lebih baru)
- PostgreSQL
- npm atau yarn

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd platform-aspirasi-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env` dengan konfigurasi yang sesuai:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=platform_aspirasi
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Setup database**
   - Buat database PostgreSQL
   - Jalankan migrations (jika menggunakan Sequelize CLI)

5. **Jalankan aplikasi**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📊 Database Schema

### Status Enum Values

**Postingan Status:**
- `aktif`: Postingan aktif dan dapat dilihat
- `terarsip`: Postingan diarsipkan

**Interaksi Status:**
- `aktif`: Interaksi aktif
- `diabaikan`: Laporan diabaikan
- `diselesaikan`: Laporan telah diselesaikan

## 🔧 Scripts

```bash
npm run dev      # Jalankan dengan nodemon (development)
npm start        # Jalankan production mode
npm test         # Jalankan tests (belum dikonfigurasi)
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 License

Distributed under the ISC License.
