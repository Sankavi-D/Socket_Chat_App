const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { User, Room, Message } = require('./models');
const app = express();

require('dotenv').config();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});

const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`));

const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', async (socket) => {
  console.log('Socket connected', socket.id);

  // Register user to a room
  socket.on('register', async ({ name, roomName }) => {
    let room = await Room.findOne({ roomName });
    if (!room) {
      room = new Room({ roomName, userIds: [] });
      await room.save();
    }

    let user = await User.findOne({ name, roomId: room._id });
    if (!user) {
      user = new User({ name, socketId: socket.id, roomId: room._id });
      await user.save();
    } else {
      user.socketId = socket.id;
      await user.save();
    }

    // Join the room
    socket.join(room.roomName);
    io.to(room.roomName).emit('message', { name: 'System', message: `${name} has joined the room` });
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Socket disconnected', socket.id);
    const user = await User.findOne({ socketId: socket.id });
    if (user) {
      const room = await Room.findById(user.roomId);
      io.to(room.roomName).emit('message', { name: 'System', message: `${user.name} has left the room` });
    }
  });

  // Handle incoming messages
  socket.on('message', async (data) => {
    const user = await User.findOne({ socketId: socket.id });
    if (user) {
      const room = await Room.findById(user.roomId);
      const message = new Message({
        roomId: room._id,
        senderId: user._id,
        message: data.message,
        dateTime: new Date()
      });
      await message.save();
      io.to(room.roomName).emit('chat-message', message);
    }
  });

  // Handle typing feedback
  socket.on('feedback', (data) => {
    const user = User.findOne({ socketId: socket.id });
    if (user) {
      const room = Room.findById(user.roomId);
      socket.to(room.roomName).emit('feedback', data);
    }
  });

  // Handle message read
  socket.on('message-read', async (messageId) => {
    await Message.updateOne({ _id: messageId }, { isRead: true });
  });
});

module.exports = server;
