const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class RegistrationError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "RegistrationError";
    this.statusCode = statusCode;
  }
}

function isValidEmail(value) {
  if (!value || typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function assertValidRegisterPayload({ name, email, password }) {
  if (
    name === undefined ||
    name === null ||
    email === undefined ||
    email === null ||
    password === undefined ||
    password === null
  ) {
    throw new RegistrationError(400, "Informe nome, e-mail e senha.");
  }

  const trimmedName = String(name).trim();
  if (trimmedName.length === 0) {
    throw new RegistrationError(400, "O nome é obrigatório.");
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    throw new RegistrationError(400, "O e-mail informado não é válido.");
  }

  if (String(password).length < 8) {
    throw new RegistrationError(
      400,
      "A senha deve ter no mínimo 8 caracteres."
    );
  }

  return { trimmedName, normalizedEmail, password };
}

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
  const { trimmedName, normalizedEmail, password: rawPassword } =
    assertValidRegisterPayload({ name, email, password });

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new RegistrationError(409, "E-mail já cadastrado");
  }

  const passwordHash = await bcrypt.hash(rawPassword, 10);
  const user = await User.create({
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
  });
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
