const express = require('express')
const path = require('path')
const app = express()

require('dotenv').config();
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))

let socketsConected = new Map()

io.on('connection', onConnected)

function onConnected(socket) {
  console.log('Socket connected: ', socket.id)
  socketsConected.set(socket.id, { socket: socket, name: 'anonymous' })
  // socketsConected.add(socket.id)
  io.emit('clients-total', socketsConected.size)

  socket.on('disconnect', () => {
    console.log('Socket disconnected: ', socket.id)
    socketsConected.delete(socket.id)
    io.emit('clients-total', socketsConected.size)
  })

  socket.on('register-name', (name) => {
    if (socketsConected.has(socket.id)) {
      socketsConected.get(socket.id).name = name
    }
  })

  socket.on('message', (data) => {
    // console.log(data)
    // socket.broadcast.emit('chat-message', data)
    const { targetId, message } = data
    if (targetId && socketsConected.has(targetId)) {
      socketsConected.get(targetId).socket.emit('chat-message', {
        message: message,
        name: socketsConected.get(socket.id).name,
        dateTime: new Date(),
        from: socket.id
      })
    } else {
      socket.broadcast.emit('chat-message', {
        message: message,
        name: socketsConected.get(socket.id).name,
        dateTime: new Date()
      })
    }
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })
}
