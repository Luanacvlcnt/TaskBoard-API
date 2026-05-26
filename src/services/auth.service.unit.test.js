const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { registerUser } = require("./auth.service");

jest.mock("../models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("auth.service - registerUser", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      JWT_SECRET: "test-secret",
      JWT_EXPIRES_IN: "1h",
    };
    jwt.sign.mockReturnValue("mock-jwt");
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("persists user with bcrypt hash and returns JWT on success", async () => {
    const createdAt = new Date("2026-03-01T12:00:00.000Z");
    const updatedAt = createdAt;

    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-password");
    User.create.mockResolvedValue({
      _id: { toString: () => "user-id-1" },
      name: "Joao",
      email: "joao@email.com",
      createdAt,
      updatedAt,
    });

    const result = await registerUser({
      name: "  Joao ",
      email: "  JOAO@EMAIL.COM  ",
      password: "12345678",
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: "joao@email.com" });
    expect(bcrypt.hash).toHaveBeenCalledWith("12345678", 10);
    expect(User.create).toHaveBeenCalledWith({
      name: "Joao",
      email: "joao@email.com",
      passwordHash: "hashed-password",
    });
    expect(jwt.sign).toHaveBeenCalled();
    expect(result.token).toBe("mock-jwt");
    expect(result.user).toEqual({
      id: "user-id-1",
      name: "Joao",
      email: "joao@email.com",
      createdAt,
      updatedAt,
    });
  });

  it("rejects duplicate email with 409", async () => {
    User.findOne.mockResolvedValue({ _id: "existing" });

    await expect(
      registerUser({
        name: "Maria",
        email: "joao@email.com",
        password: "12345678",
      })
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "E-mail já cadastrado",
    });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  it("rejects password shorter than 8 characters with 400", async () => {
    User.findOne.mockResolvedValue(null);

    await expect(
      registerUser({
        name: "Maria",
        email: "maria@email.com",
        password: "short",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "A senha deve ter no mínimo 8 caracteres.",
    });

    expect(User.create).not.toHaveBeenCalled();
  });

  it("rejects invalid email format with 400", async () => {
    await expect(
      registerUser({
        name: "Maria",
        email: "not-an-email",
        password: "12345678",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "O e-mail informado não é válido.",
    });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it("rejects empty or whitespace-only name with 400", async () => {
    await expect(
      registerUser({
        name: "",
        email: "maria@email.com",
        password: "12345678",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "O nome é obrigatório.",
    });

    await expect(
      registerUser({
        name: "   ",
        email: "maria@email.com",
        password: "12345678",
      })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "O nome é obrigatório.",
    });
  });

  it("rejects missing fields with 400", async () => {
    await expect(registerUser({})).rejects.toMatchObject({
      statusCode: 400,
      message: "Informe nome, e-mail e senha.",
    });
  });

});
