const { createTask } = require("../services/task.service");

async function create(req, res) {
  try {
    const task = await createTask(req.userId, req.body);
    return res.status(201).json({ task });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

module.exports = { create };
