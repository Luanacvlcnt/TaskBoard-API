const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./auth.middleware");

jest.mock("jsonwebtoken");

describe("authMiddleware", () => {
  const TOKEN_MSG = "Token não fornecido ou inválido";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  function mockRes() {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { json, status };
  }

  it("responds 401 when Authorization header is missing", () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: TOKEN_MSG });
    expect(next).not.toHaveBeenCalled();
  });

  it("responds 401 when scheme is not Bearer", () => {
    const req = { headers: { authorization: "Basic abc" } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: TOKEN_MSG });
    expect(next).not.toHaveBeenCalled();
  });

  it("responds 401 when token verification fails", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("invalid");
    });

    const req = { headers: { authorization: "Bearer bad-token" } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("bad-token", "test-secret");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: TOKEN_MSG });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and sets req.userId on valid Bearer token", () => {
    jwt.verify.mockReturnValue({ sub: "user-123" });

    const req = { headers: { authorization: "Bearer good-token" } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.userId).toBe("user-123");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
