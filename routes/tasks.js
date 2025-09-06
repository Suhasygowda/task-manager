const express = require('express');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  markComplete,
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth); // All routes require authentication

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', markComplete);

module.exports = router;