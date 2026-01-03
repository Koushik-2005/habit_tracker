import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import habitRoutes from './routes/habits.js';
import weekRoutes from './routes/weeks.js';
import { createNewWeekIfNeeded } from './controllers/weekController.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the backend directory
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/habits', habitRoutes);
app.use('/api/week', weekRoutes);
app.use('/api/weeks', weekRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    timezone: process.env.TZ || 'UTC'
  });
});

// MongoDB Connection and Start Server
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    
    // Create initial week on startup if needed
    await createNewWeekIfNeeded();
    
    // Start server only after DB is connected
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📅 Timezone: ${process.env.TZ || 'UTC'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Cron job: Run every Sunday at 00:05 AM IST to create new week
// Cron format: minute hour day-of-month month day-of-week (0 = Sunday)
cron.schedule('5 0 * * 0', async () => {
  console.log('🔄 Weekly cron job triggered (Sunday) - Creating new week...');
  try {
    await createNewWeekIfNeeded();
    console.log('✅ New week created successfully');
  } catch (error) {
    console.error('❌ Error in weekly cron job:', error);
  }
}, {
  timezone: 'Asia/Kolkata'
});

// Keep process alive and handle errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
