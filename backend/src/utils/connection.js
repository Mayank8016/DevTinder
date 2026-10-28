const ConnectionRequest = require('../models/request');
const areConnected = (a, b) =>
  ConnectionRequest.exists({
    status: 'accepted',
    $or: [{ fromUserId: a, toUserId: b }, { fromUserId: b, toUserId: a }],
  });
module.exports = { areConnected };
