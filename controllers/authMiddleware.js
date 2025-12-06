const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('🔐 Verificando autenticación...');
  console.log('📦 Cookies recibidas:', req.cookies);

  const token = req.cookies?.Token;

  if (!token) {
    console.log('❌ No hay token en las cookies');
    return res.status(401).json({ mensaje: 'Acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    console.log('✅ Token válido. Usuario:', req.user);
    next();
  } catch (err) {
    console.error('❌ Error verificando token:', err.message);
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = { authMiddleware };
