const express = require('express');
const router = express.Router();
const { TasksDB } = require('../db');

// 1. POST ROUTE: Saves a brand new prioritized task node to the database
router.post('/add', async (req, res) => {
  try {
    const { text, quadrant, fromTime, toTime, day, userEmail } = req.body;

    if (!text || !userEmail) {
      return res.status(400).json({ message: "Task description and user email cannot be blank." });
    }

    const newTaskNode = {
      userEmail: userEmail.trim().toLowerCase(),
      text,
      quadrant: quadrant || 'q1',
      fromTime: fromTime || '09:00',
      toTime: toTime || '10:00',
      day: day || 'Mon',
      completed: false,
      createdAt: new Date()
    };

    const savedRecord = await TasksDB.insert(newTaskNode);
    res.status(201).json(savedRecord);

  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Failed to persist task to storage." });
  }
});

// 2. GET/POST ROUTE: Fetches all database items belonging strictly to the active logged email
router.post('/fetch-all', async (req, res) => {
  try {
    const { userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ message: "User session email context missing." });
    }

    const userTasks = await TasksDB.find({ userEmail: userEmail.trim().toLowerCase() });
    res.json(userTasks);

  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Failed to query tasks." });
  }
});

// 3. PUT/POST ROUTE: Toggles completion check status or updates specific task
router.post('/toggle-status', async (req, res) => {
  try {
    const { taskId, completedStatus } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID parameter is required." });
    }

    const targetTask = await TasksDB.findOne({ _id: taskId });
    if (!targetTask) {
      return res.status(404).json({ message: "Target task not found." });
    }

    const updatedTaskData = {
      ...targetTask,
      completed: Boolean(completedStatus)
    };

    await TasksDB.update({ _id: taskId }, updatedTaskData);
    res.json({ message: "Status synchronized successfully.", taskId, completed: Boolean(completedStatus) });

  } catch (err) {
    console.error("Error toggling task:", err);
    res.status(500).json({ message: "Error updating task status." });
  }
});

// 4. PURGE ROUTE: Deletes ALL accumulated tasks belonging to the verified email
router.post('/purge-history', async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: "User session email validation token missing." });
    }

    await TasksDB.remove({ userEmail: userEmail.trim().toLowerCase() }, { multi: true });
    res.json({ message: "Your absolute tasks workflow log history has been wiped clean." });

  } catch (err) {
    console.error("Error purging tasks:", err);
    res.status(500).json({ message: "Failed to purge database data records safely." });
  }
});

module.exports = router;
