const Task = require("../models/Task");

function sanitizeTask(taskDoc) {
  return {
    id: taskDoc._id.toString(),
    title: taskDoc.title,
    description: taskDoc.description,
    status: taskDoc.status,
    userId: taskDoc.user.toString(),
    createdAt: taskDoc.createdAt,
    updatedAt: taskDoc.updatedAt,
  };
}

function assertTitlePresent(title) {
  if (title === undefined || title === null) {
    throw new Error("O título é obrigatório.");
  }
  const trimmed = String(title).trim();
  if (trimmed.length === 0) {
    throw new Error("O título é obrigatório.");
  }
  return trimmed;
}

async function createTask(userId, { title, description } = {}) {
  const safeTitle = assertTitlePresent(title);
  const trimmedDescription =
    description === undefined || description === null
      ? ""
      : String(description).trim();

  const task = await Task.create({
    title: safeTitle,
    description: trimmedDescription,
    status: "pendente",
    user: userId,
  });

  return sanitizeTask(task);
}

async function listTasksForUser(userId) {
  const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
  return tasks.map((task) => sanitizeTask(task));
}

module.exports = { createTask, listTasksForUser };
