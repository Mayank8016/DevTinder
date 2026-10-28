const express = require('express');
const mongoose = require('mongoose');
const Chat = require('../models/chat');
const User = require('../models/user');
const { userauth } = require('../Middlewares/auth');
const { areConnected } = require('../utils/connection');
const { SAFE_FIELDS } = require('../utils/constants');

const chatRouter = express.Router();

chatRouter.get('/chat/:targetUserId', userauth, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    if (!mongoose.isValidObjectId(targetUserId)) return res.status(400).json({ message: 'Invalid user id' });
    if (!(await areConnected(req.user._id, targetUserId)))
      return res.status(403).json({ message: 'You can only chat with your matches' });
    const [chat, user] = await Promise.all([
      Chat.findOne({ participants: { $all: [req.user._id, targetUserId] } }),
      User.findById(targetUserId).select(SAFE_FIELDS),
    ]);
    res.json({ user, messages: chat ? chat.messages : [] });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = chatRouter;
