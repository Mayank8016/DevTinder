const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/user');
const ConnectionRequest = require('../models/request');
const { userauth } = require('../Middlewares/auth');

const requestRouter = express.Router();

// Swipe: right = interested, left = ignored. Liking someone who already liked you = match.
// Bot ko like karte hi turant match.
requestRouter.post('/request/send/:status/:toUserId', userauth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { status, toUserId } = req.params;
    if (!['ignored', 'interested'].includes(status))
      return res.status(400).json({ message: `Invalid status: ${status}` });
    if (!mongoose.isValidObjectId(toUserId)) return res.status(400).json({ message: 'Invalid user id' });
    if (fromUserId.equals(toUserId)) return res.status(400).json({ message: 'You cannot swipe on yourself' });

    const target = await User.findById(toUserId).select('isBot');
    if (!target) return res.status(404).json({ message: 'User not found' });

    const existing = await ConnectionRequest.findOne({
      $or: [{ fromUserId, toUserId }, { fromUserId: toUserId, toUserId: fromUserId }],
    });
    if (existing) {
      const theyLikedMe = existing.fromUserId.equals(toUserId) && existing.status === 'interested';
      if (!theyLikedMe) return res.status(400).json({ message: 'Already swiped on this user' });
      existing.status = status === 'interested' ? 'accepted' : 'rejected';
      await existing.save();
      const match = existing.status === 'accepted';
      return res.json({ message: match ? "It's a match!" : 'Passed', match, request: existing });
    }

    const finalStatus = target.isBot && status === 'interested' ? 'accepted' : status;
    const request = await ConnectionRequest.create({ fromUserId, toUserId, status: finalStatus });
    const match = finalStatus === 'accepted';
    res.json({
      message: match ? "It's a match!" : status === 'interested' ? 'Liked' : 'Passed',
      match,
      request,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

requestRouter.post('/request/review/:status/:requestId', userauth, async (req, res) => {
  try {
    const { status, requestId } = req.params;
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    if (!mongoose.isValidObjectId(requestId)) return res.status(400).json({ message: 'Invalid request id' });
    const request = await ConnectionRequest.findOne({
      _id: requestId, toUserId: req.user._id, status: 'interested',
    });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = status;
    await request.save();
    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = requestRouter;