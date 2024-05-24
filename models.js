const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  socketId: String,
  roomId: { type: Schema.Types.ObjectId, ref: 'Room' }
});

const RoomSchema = new Schema({
  roomName: String,
  userIds: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const MessageSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room' },
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  message: String,
  dateTime: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);
const Room = mongoose.model('Room', RoomSchema);
const Message = mongoose.model('Message', MessageSchema);

module.exports = { User, Room, Message };