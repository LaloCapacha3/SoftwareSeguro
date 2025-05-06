document.addEventListener('DOMContentLoaded', () => {
    let socket; 
    const chatButtons = document.querySelectorAll('.card__btn'); 
    let activeFullname; 
    let myUsername = document.querySelector('.users-container').dataset.myUsername; 

    function setupSocket() {
        if (socket) {
            socket.removeAllListeners(); 
        }

        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit('newPrivateUser', { user: myUsername });
            socket.emit('joinPrivateRoom');
            console.log('Events emitted after connect');
        });

        socket.on('privateMessageReceived', (data) => {
            const sender = data.user === myUsername ? 'You' : data.user;
            if (data.user !== myUsername) {  
                appendMessage(data.message, 'incoming', sender);
            }
            console.log(`Private message received: ${data.message} from ${sender}`);
        });

        socket.on('privateUserLeft', (data) => {
            appendMessage(`${data.user} left the chat`, 'info');
            console.log(`${data.user} has left the chat`);
        });
    }

    chatButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const fullname = btn.getAttribute('data-fullname');
            activeFullname = fullname; 
            var modalTitle = document.getElementById('chatModalLabel');
            modalTitle.textContent = 'Chateando con ' + fullname; 
            var chatUsername = document.querySelector('.chat-h2');
            chatUsername.textContent = fullname; 

            if (!socket || socket.disconnected) {
                socket = io(); 
                setupSocket();
            }

            document.querySelector('.chat-body').innerHTML = ''; 
        });
    });

    $('#chatModal').on('hidden.bs.modal', function () {
        if (socket) {
            socket.disconnect(); 
            socket = null; 
            console.log('Socket disconnected and reset');
        }
    });

    const messageForm = document.querySelector('.chat-footer form');
    const messageInput = document.querySelector('.form-control');
    const chatBody = document.querySelector('.chat-body');
    
    if (messageForm) {
        messageForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const message = messageInput.value.trim();
            if (message && socket) {
                socket.emit('sendPrivateMessage', { user: myUsername, message }); 
                appendMessage(message, 'outgoing', 'You');
                messageInput.value = '';
                console.log(`Private message sent: ${message}`);
            }
        }); 
    }

    function appendMessage(message, type, sender = activeFullname) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        if (type === 'info') {
            messageDiv.innerHTML = `<strong>${message}</strong>`; 
        } else {
            messageDiv.innerHTML = `<strong>${sender}:</strong> <p>${message}</p>`; 
        }
        
        chatBody.appendChild(messageDiv); 
        chatBody.scrollTop = chatBody.scrollHeight; 
        console.log(`Message appended: ${message} as ${type}`);
    }
});


document.getElementById('userInputField').addEventListener('input', filterUsers);

function filterUsers() {
    var searchValue = document.getElementById('userInputField').value.toLowerCase();
    var userCards = document.querySelectorAll('.card');

    userCards.forEach(card => {
        var fullName = card.querySelector('.card__title').textContent.toLowerCase();
        if (fullName.includes(searchValue)) {
            card.style.display = ''; 
        } else {
            card.style.display = 'none'; 
        }
    });
}
