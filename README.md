# Habit & Task Tracker

A polished, daily-use MERN stack Habit & Task Tracker application for personal productivity tracking.

![Habit Tracker Screenshot](https://via.placeholder.com/800x400?text=Habit+Tracker+Screenshot)

## 🚀 Features

- **Daily Habit Tracking** - One-click habit completion
- **Weekly Grid View** - Visual overview of your entire week
- **Progress Tracking** - Real-time progress bars and statistics
- **Historical Data** - Browse and analyze past weeks
- **Charts & Analytics** - Beautiful visualizations with Recharts
- **Mobile Responsive** - Works seamlessly on all devices
- **Timezone Aware** - Accurate date handling (Asia/Kolkata)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Charts | Recharts |
| Deployment | Vercel (Frontend) + Render (Backend) |

## 📁 Project Structure

```
habit/
├── backend/
│   ├── controllers/
│   │   ├── habitController.js
│   │   └── weekController.js
│   ├── models/
│   │   ├── Habit.js
│   │   └── Week.js
│   ├── routes/
│   │   ├── habits.js
│   │   └── weeks.js
│   ├── utils/
│   │   └── dateUtils.js
│   ├── server.js
│   ├── package.json
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vercel.json
└── README.md
```

## 🏃‍♂️ Local Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file (optional for local dev)
cp .env.example .env

npm run dev
```

Visit `http://localhost:5173` in your browser.

## 🌐 Deployment

### Backend (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Add environment variables:
   - `MONGO_URI` - Your MongoDB Atlas connection string
   - `TZ` - `Asia/Kolkata`
   - `FRONTEND_URL` - Your Vercel frontend URL

### Frontend (Vercel)

1. Import your repository on [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` - Your Render backend URL (e.g., `https://your-app.onrender.com`)

### MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Get connection string and add to backend environment

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/week/current` | Get current week data |
| POST | `/api/week/toggle` | Toggle habit completion |
| POST | `/api/habits` | Create new habit |
| GET | `/api/habits` | Get all habits |
| PUT | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Delete habit |
| GET | `/api/weeks/history` | Get week history |
| GET | `/api/weeks/stats` | Get statistics |

## 🗓️ Weekly Lifecycle

1. **Automatic Week Creation** - Backend creates new week on first access
2. **Cron Job** - Every Monday at 00:05 IST, a new week is created
3. **Immutable History** - Past weeks are read-only for data integrity

## 🎨 Architecture Highlights

- **Backend as Single Source of Truth** - All date/week logic handled server-side
- **Timezone-Aware** - Correct handling for Asia/Kolkata timezone
- **Optimistic Updates** - Instant UI feedback with server sync
- **Responsive Design** - Mobile-first Tailwind CSS styling
- **Clean Separation** - Frontend only handles UI, backend handles logic

## 📊 Data Models

### Habit
```javascript
{
  title: String,
  scheduledDays: ['Mon', 'Tue', ...],
  isActive: Boolean,
  createdAt: Date
}
```

### Week
```javascript
{
  weekId: "2026-W01",
  weekStart: Date,
  weekEnd: Date,
  habits: [{
    habitId: ObjectId,
    title: String,
    scheduledDays: Array,
    completion: { Mon: false, Tue: true, ... }
  }],
  progress: Number,
  isCurrent: Boolean
}
```

## 🔒 Security Notes

- No authentication (solo use design)
- Environment variables for all secrets
- CORS configured for specific origins
- Input validation on all endpoints

## 📝 License

MIT License - Feel free to use this for your portfolio!

---

Built with ❤️ as a portfolio project demonstrating full-stack development skills.
