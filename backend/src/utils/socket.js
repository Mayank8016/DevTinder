const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chat");
const User = require("../models/user");
const { askBot } = require("./llm");
const { areConnected } = require("./connection");

const roomOf = (a, b) => [String(a), String(b)].sort().join("_");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const { token } = cookie.parse(socket.handshake.headers.cookie || "");
      socket.userId = jwt.verify(token, process.env.JWT_SECRET)._id;
      next();
    } catch (e) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", async ({ targetUserId }) => {
      try {
        if (await areConnected(socket.userId, targetUserId))
          socket.join(roomOf(socket.userId, targetUserId));
      } catch (e) {}
    });

    socket.on("sendMessage", async ({ targetUserId, text }) => {
      try {
        text = String(text || "")
          .trim()
          .slice(0, 1000);
        if (!text || !(await areConnected(socket.userId, targetUserId))) return;
        let chat = await Chat.findOne({
          participants: { $all: [socket.userId, targetUserId] },
        });
        if (!chat)
          chat = new Chat({
            participants: [socket.userId, targetUserId],
            messages: [],
          });
        chat.messages.push({ senderId: socket.userId, text });
        await chat.save();
        const m = chat.messages[chat.messages.length - 1];
        io.to(roomOf(socket.userId, targetUserId)).emit("messageReceived", {
          _id: m._id,
          senderId: m.senderId,
          text: m.text,
          createdAt: m.createdAt,
        });
        const target =
          await User.findById(targetUserId).select("isBot +botPersona");
        if (target?.isBot) {
          const reply = await askBot(
            target.botPersona,
            chat.messages,
            targetUserId,
          );
          chat.messages.push({ senderId: targetUserId, text: reply });
          await chat.save();
          const b = chat.messages[chat.messages.length - 1];
          io.to(roomOf(socket.userId, targetUserId)).emit("messageReceived", {
            _id: b._id,
            senderId: b.senderId,
            text: b.text,
            createdAt: b.createdAt,
          });
        }
      } catch (e) {}
    });
  });
};
