const { Usuarios, Sucursal } = require('../models');
const { validateToken, generateToken } = require('../config/token');
const jwt = require('jsonwebtoken');
const bc = require('bcrypt');

const allUsers = async (req, res) => {
  try {
    const usuarios = await Usuarios.findAll({
      include: [
        {
          model: Sucursal,
          as: 'sucursal',
          attributes: ['nombre'],
        },
      ],
    });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const User = async (req, res) => {
  const id = req.params;
  res.send(id);
};

const upUser = async (req, res) => {
  try {
    const { id_usuario, nombre, rol, id_sucursal } = req.body;
    const user = await Usuarios.findOne({ where: { id_usuario } });
    /*   console.log('usuario', user); */

    if (!user) {
      return res.status(400).json({ message: '¡Usuario NO está registrado!' });
    }

    await Usuarios.update(
      { nombre, rol, id_sucursal },
      { where: { id_usuario } }
    );

    res.status(201).json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res
      .status(500)
      .json({ error: 'Error en el servidor', details: error.message });
  }
};

const addUser = async (req, res) => {
  console.log('paso x aca', req.body);
  try {
    const { nombre, rol, id_sucursal } = req.body;
    const password = req.body.password || '123456'; // 👈 default

    console.log('body', req.body);

    const user = await Usuarios.findOne({ where: { nombre } });

    if (user) {
      return res.status(400).json({ message: '¡Usuario ya existente!' });
    }

    const newUser = await Usuarios.create({
      nombre,
      password,
      rol,
      id_sucursal,
    });
    res.status(201).json({ message: 'Usuario creado exitosamente', newUser });
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    res
      .status(500)
      .json({ error: 'Error en el servidor', details: error.message });
  }
};

const login = async (req, res) => {
  const { nombre, password } = req.body;

  try {
    const user = await Usuarios.findOne({ where: { nombre } });
    if (!user) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const isValid = await user.validatePass(password);
    if (!isValid) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const sucursal = await Sucursal.findOne({
      where: { id_sucursal: user.id_sucursal },
    });

    const payload = {
      id: user.id_usuario,
      nombre: user.nombre,
      rol: user.rol,
      admin: user.rol === 'admin', // 👈 Agregar campo admin
      sucursal_id: user.id_sucursal,
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '4h' });

    // ✅ CORRECCIÓN: Configuración correcta según el entorno
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // false en desarrollo
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Lax en desarrollo
      maxAge: 8 * 60 * 60 * 1000, // 8 horas (igual que el token)
    };

    console.log('🍪 Cookie options:', cookieOptions);

    res
      .cookie('Token', token, cookieOptions)
      .status(200)
      .json({
        user: nombre,
        id: user.id_usuario,
        admin: user.rol === 'admin',
        mensaje: 'Autorizado',
        Sucursal: user.id_sucursal,
        NombreSucursal: sucursal.nombre,
        // ⚠️ NO envíes el token en el body si usas cookies
        // token: token,
      });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const resetPassword = async (req, res) => {
  const { nombre, new_password } = req.body;

  try {
    const user = await Usuarios.findOne({ where: { nombre } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar nuevo salt y hashear la nueva contraseña
    const newSalt = await bc.genSalt();
    const newHashedPassword = await bc.hash(new_password, newSalt);

    // Actualizar el usuario
    user.password = newHashedPassword;
    user.salt = newSalt;
    await user.save();

    res.status(200).json({ message: 'Contraseña reseteada exitosamente' });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const getUser = (req, res) => {
  // req.user ya viene del middleware authMiddleware
  console.log('✅ Usuario autenticado:', req.user);

  res.status(200).json({
    id: req.user.id,
    nombre: req.user.nombre,
    rol: req.user.rol,
    admin: req.user.admin || req.user.rol === 'admin',
  });
};

const logout = (req, res) => {
  res.clearCookie('Token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  });

  res.status(200).json({ mensaje: 'Sesión cerrada' });
};
module.exports = {
  allUsers,
  User,
  addUser,
  login,
  resetPassword,
  getUser,
  logout,
  upUser,
};
