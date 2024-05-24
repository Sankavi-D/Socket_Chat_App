// main.js

const socket = io();

const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const roomInput = document.getElementById('room-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageTone = new Audio('/message-tone.mp3');

// Send message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// Register user on connection
socket.on('connect', () => {
  socket.emit('register', { name: nameInput.value, roomName: roomInput.value });
});

// Update registration on name or room change
nameInput.addEventListener('change', () => {
  socket.emit('register', { name: nameInput.value, roomName: roomInput.value });
});
roomInput.addEventListener('change', () => {
  socket.emit('register', { name: nameInput.value, roomName: roomInput.value });
});

// Update client total
socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

// Send message function
function sendMessage() {
  if (messageInput.value === '') return;
  const data = { message: messageInput.value };
  socket.emit('message', data);
  messageInput.value = '';
}

// Receive message
socket.on('chat-message', (message) => {
  messageTone.play();
  addMessageToUI(message.senderId === socket.id, message);
});

// Add message to UI
function addMessageToUI(isOwnMessage, message) {
  clearFeedback();
  const messageElement = document.createElement('li');
  messageElement.classList.add('message-item');
  messageElement.classList.add(isOwnMessage ? 'message-right' : 'message-left');
  
  const messageText = document.createElement('p');
  messageText.classList.add('message');
  messageText.textContent = message.message;

  const messageInfo = document.createElement('span');
  messageInfo.textContent = `${message.name} ● ${moment(message.dateTime).fromNow()}`;
  messageText.appendChild(messageInfo);
  messageElement.appendChild(messageText);
  messageContainer.appendChild(messageElement);
  
  scrollToBottom();

  if (!isOwnMessage) {
    // Notify server that the message has been read
    socket.emit('message-read', message._id);
  }
}

// Scroll to bottom of messages
function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Typing feedback
messageInput.addEventListener('focus', () => {
  socket.emit('feedback', { feedback: `✍️ ${nameInput.value} is typing a message` });
});
messageInput.addEventListener('keypress', () => {
  socket.emit('feedback', { feedback: `✍️ ${nameInput.value} is typing a message` });
});
messageInput.addEventListener('blur', () => {
  socket.emit('feedback', { feedback: '' });
});

// Handle typing feedback
socket.on('feedback', (data) => {
  clearFeedback();
  const feedbackElement = document.createElement('li');
  feedbackElement.classList.add('message-feedback');
  feedbackElement.innerHTML = `<p class="feedback" id="feedback">${data.feedback}</p>`;
  messageContainer.appendChild(feedbackElement);
});

// Clear feedback
function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
