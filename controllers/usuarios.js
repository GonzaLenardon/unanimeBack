const { Usuarios, Sucursal } = require('../models');
const { validateToken, generateToken } = require('../config/token');
const jwt = require('jsonwebtoken');
const bc = require('bcrypt');

const allUsers = async (req, res) => {
  try {
    const usuarios = await Usuarios.findAll();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const User = async (req, res) => {
  const id = req.params;
  res.send(id);
};

const addUser = async (req, res) => {
  console.log('paso x aca', req.body);
  try {
    const { nombre, password, rol, id_sucursal } = req.body;
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
  console.log('estoy back login', nombre, password);

  try {
    const user = await Usuarios.findOne({ where: { nombre } });
    if (!user)
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });

    const isValid = await user.validatePass(password);

    if (!isValid)
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const payload = {
      id: user.id_usuario,
      nombre: user.nombre,
      rol: user.rol,
    };

    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '8h' });
    /* res.status(200).json({ token, user: nombre, mensaje: 'Autorizado' }); */

    console.log('secure', process.env.NODE_ENV === 'production');
    console.log(
      'sameSite',
      process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    );

    res
      .cookie('Token', token, {
        httpOnly: true,
        /* secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', */
        secure: true,
        sameSite: 'None',
        maxAge: 4 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        user: nombre,
        id: user.id_usuario,
        mensaje: 'Autorizado',
        Sucursal: user.id_sucursal,
      });
  } catch (error) {
    console.error(error);
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
  const token = req.cookies.Token;
  console.log('GETUSER ... ', token);

  if (!token) return res.status(401).json({ mensaje: 'Sesión expirada' });

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    res.status(200).json(decoded);
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

const logout = (req, res) => {
  res.clearCookie('Token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/', // Asegurate de usar el mismo path que usaste al setearla
  });

  res.status(200).json({ message: 'Sesión cerrada correctamente' });
};

module.exports = {
  allUsers,
  User,
  addUser,
  login,
  resetPassword,
  getUser,
  logout,
};
