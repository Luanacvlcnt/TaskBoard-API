const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { loginUser } = require("./auth.service");

jest.mock("bcryptjs");
jest.mock("../models/User");

describe("auth.service - loginUser", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      JWT_SECRET: "test-secret",
      JWT_EXPIRES_IN: "1h",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns user and JWT token on successful login", async () => {
    const mockUser = {
      _id: { toString: () => "user-id-1" },
      name: "Joao",
      email: "joao@email.com",
      passwordHash: "hashed-password",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const result = await loginUser({
      email: "joao@email.com",
      password: "12345678",
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: "joao@email.com" });
    expect(bcrypt.compare).toHaveBeenCalledWith("12345678", "hashed-password");
    expect(result.user).toEqual({
      id: "user-id-1",
      name: "Joao",
      email: "joao@email.com",
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
    });

    const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
    expect(decoded.sub).toBe("user-id-1");
    expect(decoded.exp).toBeDefined();
  });

  it("throws unauthorized error when email is not found", async () => {
    User.findOne.mockResolvedValue(null);

    await expect(
      loginUser({
        email: "naoexiste@email.com",
        password: "12345678",
      })
    ).rejects.toThrow("Credenciais inválidas");
  });

  it("throws unauthorized error when password is invalid", async () => {
    const mockUser = {
      _id: { toString: () => "user-id-1" },
      passwordHash: "hashed-password",
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      loginUser({
        email: "joao@email.com",
        password: "wrong-password",
      })
    ).rejects.toThrow("Credenciais inválidas");
  });
});
