const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('estoy en AuthMidde', req.cookies);
  const token = req.cookies?.Token;

  if (!token) return res.status(401).json({ mensaje: 'Acceso no autorizado' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = { authMiddleware };
