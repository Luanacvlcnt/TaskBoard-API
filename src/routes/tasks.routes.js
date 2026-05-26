const { Router } = require("express");
const { create, list } = require("../controllers/task.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const tasksRouter = Router();

tasksRouter.get("/", authMiddleware, list);
tasksRouter.post("/", authMiddleware, create);

module.exports = tasksRouter;
