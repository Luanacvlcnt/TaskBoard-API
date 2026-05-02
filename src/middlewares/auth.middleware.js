const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "Token não fornecido ou inválido",
    });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Token não fornecido ou inválido",
    });
  }

  try {
    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Token não fornecido ou inválido",
    });
  }
}

module.exports = { authMiddleware };
