# 📅 Calendarly - Full Stack Calendar App

**Calendarly** is a full stack calendar web application designed to help students and professionals stay organized with important deadlines, assignments, and personal events.

This project includes both a **React-based frontend** and a **Node.js/Express backend**, communicating via REST APIs and backed by a lightweight database.

---

## 🧭 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Tech Stack](#tech-stack)
- [Author](#author)
- [Future Improvements](#future-improvements)

---

## 🚀 Features

- 📆 Visual calendar with assignment/event tracking
- 🤖 AI-powered event extraction from text and PDF files
- 💬 Chat-style UI for adding tasks (AssignmentChat)
- 📊 Daily usage limits (3 requests per day)
- 🔗 Connected frontend-backend architecture
- 📁 Local database storage (SQLite)
- ✨ Modular and clean codebase
- 🌐 Production-ready deployment setup

---

## 📁 Project Structure

```
Calendarly/
├── calendar-app/           # Frontend (React + Vite)
│   ├── src/
│   │   ├── Components/
│   │   │   ├── AssignmentChat.jsx
│   │   │   └── CalendarApp.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── README.md (Frontend-specific)
│
├── calendar-backend/       # Backend (Node.js + Express)
│   ├── db.js
│   ├── index.js
│   ├── calendar.db
│   ├── package.json
│   └── README.md (Backend-specific)
│
└── README.md               # ← You are here (combined root README)
```

---

## ⚙️ Setup Instructions

### 🔹 1. Clone the repo

```bash
git clone https://github.com/rahulrakesh10/Calendarly.git
cd Calendarly
```

---

### 🔹 2. Environment Setup

#### Backend Environment Variables
```bash
cd calendar-backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

#### Frontend Environment Variables
```bash
cd calendar-app
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL
```

---

### 🔹 3. Setup the Backend

```bash
cd calendar-backend
npm install
node index.js
```

Or use:

```bash
nodemon index.js
```

---

### 🔹 4. Setup the Frontend

Open a new terminal tab:

```bash
cd calendar-app
npm install
npm run dev
```

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variable `VITE_API_URL` to your backend URL
4. Deploy

### Backend (Render)
1. Push your code to GitHub
2. Connect your repository to Render
3. Set environment variables:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `NODE_ENV`: production
4. Deploy

**Note**: Update the CORS origin in `calendar-backend/index.js` with your actual Vercel domain.

---

## 🌐 API Endpoints (Backend)

| Method | Endpoint         | Description               |
|--------|------------------|---------------------------|
| GET    | `/`              | Health check              |
| GET    | `/api/usage`     | Get daily usage limit     |
| POST   | `/api/extract-events` | Extract events from text/PDF |
| GET    | `/events`        | Fetch all calendar events |
| POST   | `/events`        | Add a new event           |
| DELETE | `/events/:id`    | Delete an event by ID     |

---

## 🛠 Tech Stack

### Frontend:
- React
- Vite
- JavaScript (JSX)
- CSS Modules

### Backend:
- Node.js
- Express
- SQLite (via `sqlite3` or a custom `db.js`)

---

## 👨‍💻 Author

- **Rahul Rakesh**
- GitHub: [@rahulrakesh10](https://github.com/rahulrakesh10)

---

## 🚧 Future Improvements

- 🔐 Add user authentication
- 🔁 Support recurring events
- ✏️ Allow editing events
- 🗓️ Google Calendar sync
- 🔔 Notifications & Reminders

---

## 📬 Contributions

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## 📝 License

This project is open source and available under the MIT License.
# Calendarly
