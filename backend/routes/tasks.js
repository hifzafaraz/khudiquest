const express = require('express');
const router = express.Router();
const Datastore = require('nedb-promises');
const path = require('path');

// Initialize a dedicated data file strictly for user todo planning items
const TasksDB = Datastore.create({ filename: path.join(__dirname, '../data/tasks.db'), autoload: true });

// 1. POST ROUTE: Saves a brand new prioritized task node to the database file
router.post('/add', async (req, res) => {
  try {
    const { text, quadrant, fromTime, toTime, day, userEmail } = req.body;

    if (!text || !userEmail) {
      return res.status(400).json({ message: "Task description parameters cannot be blank." });
    }

    const newTaskNode = {
      userEmail: userEmail.toLowerCase(),
      text,
      quadrant,
      fromTime,
      toTime,
      day,
      completed: false,
      createdAt: new Date()
    };

    const savedRecord = await TasksDB.insert(newTaskNode);
    res.status(201).json(savedRecord);

  } catch (err) {
    res.status(500).json({ message: "Failed to persist task vector to file storage." });
  }
});

// 2. GET ROUTE: Fetches all database items belonging strictly to the active logged email
router.post('/fetch-all', async (req, res) => {
  try {
    const { userEmail } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ message: "User session email context missing." });
    }

    const userTasks = await TasksDB.find({ userEmail: userEmail.toLowerCase() });
    res.json(userTasks);

  } catch (err) {
    res.status(500).json({ message: "Failed to query server datastore records." });
  }
});

// 3. PUT ROUTE: Toggles completion check status or deletes specific entry records
router.post('/toggle-status', async (req, res) => {
  try {
    const { taskId, completedStatus } = req.body;

    const targetTask = await TasksDB.findOne({ _id: taskId });
    if (!targetTask) {
      return res.status(404).json({ message: "Target token node not found inside database." });
    }

    const updatedTaskData = {
      ...targetTask,
      completed: completedStatus
    };

    await TasksDB.update({ _id: taskId }, updatedTaskData);
    res.json({ message: "Status synchronized successfully." });

  } catch (err) {
    res.status(500).json({ message: "Error updating task attribute parameters." });
  }
});
// 4. PURGE ROUTE: Deletes ALL accumulated tasks belonging to the verified email
router.post('/purge-history', async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: "User session email validation token missing." });
    }

    // NeDB/MongoDB deletes all rows matching this email parameter filter criteria
    await TasksDB.remove({ userEmail: userEmail.toLowerCase() }, { multi: true });

    res.json({ message: "Your absolute tasks workflow log history has been wiped clean." });

  } catch (err) {
    res.status(500).json({ message: "Failed to purge database data records safely." });
  }
});

module.exports = router;
