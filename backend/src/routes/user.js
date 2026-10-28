const express = require('express');
const User = require('../models/user');
const ConnectionRequest = require('../models/request');
const { userauth } = require('../Middlewares/auth');
const { SAFE_FIELDS } = require('../utils/constants');

const userRouter = express.Router();

userRouter.get('/user/requests/received', userauth, async (req, res) => {
  try {
    const rows = await ConnectionRequest.find({ toUserId: req.user._id, status: 'interested' })
      .populate('fromUserId', SAFE_FIELDS)
      .sort({ createdAt: -1 });
    res.json({ data: rows.map((r) => ({ requestId: r._id, user: r.fromUserId })) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

userRouter.get('/user/connections', userauth, async (req, res) => {
  try {
    const me = req.user._id;
    const rows = await ConnectionRequest.find({
      status: 'accepted',
      $or: [{ fromUserId: me }, { toUserId: me }],
    })
      .populate('fromUserId', SAFE_FIELDS)
      .populate('toUserId', SAFE_FIELDS);
    res.json({ data: rows.map((r) => (r.fromUserId._id.equals(me) ? r.toUserId : r.fromUserId)) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Feed: hides me, people I already swiped on, and people already resolved with me.
// People who liked me stay visible so liking back creates a match.
userRouter.get('/user/feed', userauth, async (req, res) => {
  try {
    const me = req.user._id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const rows = await ConnectionRequest.find({
      $or: [{ fromUserId: me }, { toUserId: me, status: { $ne: 'interested' } }],
    }).select('fromUserId toUserId');
    const hide = new Set([String(me)]);
    rows.forEach((r) => { hide.add(String(r.fromUserId)); hide.add(String(r.toUserId)); });
    const data = await User.find({ _id: { $nin: [...hide] } })
      .select(SAFE_FIELDS)
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
