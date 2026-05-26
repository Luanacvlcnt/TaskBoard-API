const { Router } = require("express");
const authRouter = require("./auth.routes");
const tasksRouter = require("./tasks.routes");

const router = Router();

router.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "TaskBoard API",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRouter);
router.use("/tasks", tasksRouter);

module.exports = router;
