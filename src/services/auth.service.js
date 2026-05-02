const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function sanitizeUser(userDocument) {
  return {
    id: userDocument._id.toString(),
    name: userDocument.name,
    email: userDocument.email,
    createdAt: userDocument.createdAt,
    updatedAt: userDocument.updatedAt,
  };
}

function createToken(payload) {
  const { JWT_SECRET, JWT_EXPIRES_IN = "1d" } = process.env;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("Email already registered.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = createToken({ sub: user._id.toString() });

  return { user: sanitizeUser(user), token };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("Invalid credentials.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials.");
  }

  const token = createToken({ sub: user._id.toString() });
  return { user: sanitizeUser(user), token };
}

async function getUserProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  return sanitizeUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
