const transporter = require('../config/email');
const Task = require('../models/Task');
const User = require('../models/User');
const moment = require('moment');

const sendTaskReminders = async () => {
  try {
    const today = moment().startOf('day');
    const endOfDay = moment().endOf('day');

    // Find tasks due today that haven't been completed and reminder not sent
    const tasks = await Task.find({
      dueDate: { $gte: today.toDate(), $lte: endOfDay.toDate() },
      status: { $ne: 'completed' },
      reminderSent: false,
    }).populate('user', 'name email');

    for (const task of tasks) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: task.user.email,
        subject: `Task Reminder: ${task.title}`,
        html: `
          <h3>Task Reminder</h3>
          <p>Hi ${task.user.name},</p>
          <p>This is a reminder that your task "${task.title}" is due today.</p>
          <p><strong>Description:</strong> ${task.description || 'No description'}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Due Date:</strong> ${moment(task.dueDate).format('MMMM Do YYYY, h:mm a')}</p>
          <p>Please complete this task as soon as possible.</p>
          <br>
          <p>Best regards,</p>
          <p>Task Manager Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      
      // Mark reminder as sent
      task.reminderSent = true;
      await task.save();
      
      console.log(`Reminder sent to ${task.user.email} for task: ${task.title}`);
    }
  } catch (error) {
    console.error('Error sending task reminders:', error);
  }
};

const sendOverdueTaskReminders = async () => {
  try {
    const now = moment();

    // Find overdue tasks that haven't been completed
    const tasks = await Task.find({
      dueDate: { $lt: now.toDate() },
      status: { $ne: 'completed' },
      overdueReminderSent: false,
    }).populate('user', 'name email');

    for (const task of tasks) {
      // Update task status to overdue
      task.status = 'overdue';
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: task.user.email,
        subject: `OVERDUE Task: ${task.title}`,
        html: `
          <h3 style="color: red;">Overdue Task Alert</h3>
          <p>Hi ${task.user.name},</p>
          <p>Your task "${task.title}" is now overdue.</p>
          <p><strong>Description:</strong> ${task.description || 'No description'}</p>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Due Date:</strong> ${moment(task.dueDate).format('MMMM Do YYYY, h:mm a')}</p>
          <p><strong>Days Overdue:</strong> ${now.diff(moment(task.dueDate), 'days')} days</p>
          <p style="color: red;">Please complete this task immediately!</p>
          <br>
          <p>Best regards,</p>
          <p>Task Manager Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      
      // Mark overdue reminder as sent
      task.overdueReminderSent = true;
      await task.save();
      
      console.log(`Overdue reminder sent to ${task.user.email} for task: ${task.title}`);
    }
  } catch (error) {
    console.error('Error sending overdue task reminders:', error);
  }
};

module.exports = {
  sendTaskReminders,
  sendOverdueTaskReminders,
};