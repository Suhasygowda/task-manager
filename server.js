const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cron = require('node-cron');
const { sendTaskReminders, sendOverdueTaskReminders } = require('./controllers/emailController');
const path = require("path");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve React build
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});
// Schedule email reminders
// Run every hour to check for tasks due today
cron.schedule('0 * * * *', () => {
  console.log('Checking for tasks due today...');
  sendTaskReminders();
});

// Run daily at 9 AM to check for overdue tasks
cron.schedule('0 9 * * *', () => {
  console.log('Checking for overdue tasks...');
  sendOverdueTaskReminders();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});