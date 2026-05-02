const { Router } = require("express");
const { create } = require("../controllers/task.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const tasksRouter = Router();

tasksRouter.post("/", authMiddleware, create);

module.exports = tasksRouter;
