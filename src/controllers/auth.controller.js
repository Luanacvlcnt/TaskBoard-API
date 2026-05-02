const {
  registerUser,
  loginUser,
  getUserProfile,
} = require("../services/auth.service");

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required.",
      });
    }

    const result = await registerUser({ name, email, password });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required.",
      });
    }

    const result = await loginUser({ email, password });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

async function me(req, res) {
  try {
    const user = await getUserProfile(req.userId);
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}

module.exports = { register, login, me };
