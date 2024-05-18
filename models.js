const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  socketId: { type: String, required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
})

const roomSchema = new mongoose.Schema({
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  roomName: { type: String, required: true, unique: true },
})

const User = mongoose.model('User', userSchema)
const Room = mongoose.model('Room', roomSchema)

module.exports = { User, Room }
