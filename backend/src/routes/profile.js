const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/user');
const { userauth } = require('../Middlewares/auth');
const { validateEditProfile } = require('../utils/validation');

const profileRouter = express.Router();

profileRouter.get('/profile/view', userauth, (req, res) => res.json({ user: req.user.toSafe() }));

profileRouter.patch('/profile/edit', userauth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) throw new Error('Invalid edit request');
    const user = req.user;
    Object.keys(req.body).forEach((k) => (user[k] = req.body[k]));
    await user.save();
    res.json({ message: `${user.firstName}, your profile was updated`, user: user.toSafe() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

profileRouter.patch('/profile/password', userauth, async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.validatePassword(password))) throw new Error('Old password is incorrect');
    if (!validator.isStrongPassword(newPassword)) throw new Error('Enter a strong new password');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = profileRouter;
