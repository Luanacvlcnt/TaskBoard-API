const { Router } = require("express");
const { register, login, me } = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authMiddleware, me);

module.exports = authRouter;
