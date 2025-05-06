document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const myUsername = document.querySelector('.forum-chat-page').dataset.myUsername;  
    const room = "forum123"; 
    let userColors = {};
    let colorClasses = ['message-blue', 'message-purple', 'message-orange', 'message-yellow', 'message-another'];
    
    const chatBody = document.querySelector('.forum-chat-body');
    const messageForm = document.querySelector('#forum-message-form');
    const messageInput = document.querySelector('#forum-message-form input[type="text"]');

    socket.on('connect', () => {
        console.log('Connected to server as', myUsername);
        socket.emit('joinRoom', { username: myUsername, room });
        if (!userColors[myUsername]) {
            userColors[myUsername] = colorClasses.shift() || 'message-another';
        }
    });

    socket.on('newMessage', (data) => {
        if(data.user !== myUsername) {
            const sender = data.user;
            appendMessage(data.message, 'incoming', sender);
        }
    });

    socket.on('userJoined', (data) => {
        if (!userColors[data.user] && data.user !== myUsername) {
            userColors[data.user] = colorClasses.shift(); 
        }
        appendMessage(`${data.user} joined the chat`, 'info');
    });

    socket.on('userLeft', (data) => {
        if (userColors[data.user]) {
            colorClasses.push(userColors[data.user]);
            delete userColors[data.user];
        }
        appendMessage(`${data.user} left the chat`, 'info');
    });

    if (messageForm) {
        messageForm.addEventListener('submit', handleFormSubmit);
    }

    function handleFormSubmit(event) {
        event.preventDefault();
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('newMessage', { room, user: myUsername, message });
            appendMessage(message, 'outgoing', 'You'); 
            messageInput.value = '';
        }
    }

    function appendMessage(message, type, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('forum-message', type);
    
        if (sender !== 'You') {
            let colorClass = userColors[sender] || 'message-another'; 
            messageDiv.classList.add(colorClass); 
        } else {
            messageDiv.classList.add('message-green');
        }
    
        if (type === 'info') {
            messageDiv.innerHTML = `<strong>${message}</strong>`;
            messageDiv.style.display = 'block';
        } else {
            messageDiv.innerHTML = `<strong>${sender}:</strong> <p>${message}</p>`;
        }
        messageDiv.style.display = 'block';
    
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    

    window.addEventListener('beforeunload', () => {
        socket.emit('leaveRoom', { username: myUsername, room }); 
        if (socket) {
            socket.disconnect();
        }
    });
});
