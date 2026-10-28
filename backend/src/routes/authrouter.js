const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { validateSignupData } = require('../utils/validation');
const rateLimiter = require('../Middlewares/rateLimiter');

const authRouter = express.Router();
const isProd = process.env.NODE_ENV === 'production';
const cookieOpts = () => ({
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure: isProd,
  maxAge: 24 * 3600 * 1000,
});

authRouter.post('/signup', rateLimiter({max: 5}),async (req, res) => {
  try {
    validateSignupData(req);
    const { firstName, lastName, emailId, password } = req.body;
    const user = new User({ firstName, lastName, emailId, password: await bcrypt.hash(password, 10) });
    await user.save();
    res.cookie('token', user.getJWT(), cookieOpts());
    res.status(201).json({ message: 'User created successfully', user: user.toSafe() });
  } catch (err) {
    const msg = err.code === 11000 ? 'Email already registered' : err.message;
    res.status(400).json({ message: msg });
  }
});

authRouter.post('/login', rateLimiter({max: 5}),async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId }).select('+password');
    if (!user || !(await user.validatePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.cookie('token', user.getJWT(), cookieOpts());
    res.json({ message: 'Logged in successfully', user: user.toSafe() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOpts()).json({ message: 'Logout successful' });
});

module.exports = authRouter;
