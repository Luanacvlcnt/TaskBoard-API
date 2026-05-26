const { createTask, listTasksForUser } = require("../services/task.service");

async function create(req, res) {
  try {
    const task = await createTask(req.userId, req.body);
    return res.status(201).json({ task });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function list(req, res) {
  const tasks = await listTasksForUser(req.userId);
  return res.status(200).json({ tasks });
}

module.exports = { create, list };
