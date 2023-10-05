// const { json } = require("express");

// script.js
const socket = io(); // Initialize Socket.io
let landing = document.getElementById('landing');
let chat = document.getElementById('chat');
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInput');
const chatContainer = document.querySelector('.container');

function enterChat() {
    const name = document.getElementById('name').value;
    socket.emit('new-user-joined', name);
    chat.style.display = 'block';
    landing.style.display = 'none';
}

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert 24-hour format to 12-hour format
    if (hours > 12) {
        hours -= 12;
    } else if (hours === 0) {
        hours = 12;
    }

    return `${hours}:${minutes} ${ampm}`;
}


// console.log(name);
function append(message, user, position) {
    if (user === null) {
        let messageEle = document.createElement('div');
        messageEle.innerText = message;
        messageEle.classList.add('message')
        messageEle.classList.add(position);
        chatContainer.append(messageEle);
    }
    if (user !== null) {
        let messageEle = document.createElement('div');
        let nameEle = document.createElement('p');
        messageEle.innerText = message;
        nameEle.innerText = user + ' - ' + getCurrentTime();
        messageEle.append(nameEle);
        messageEle.classList.add('message')
        messageEle.classList.add(position);
        chatContainer.append(messageEle);
    }
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    let message = messageInput.value;
    if (message === '@users') {
        append(message, 'You', 'right');
        socket.emit('displayUsers',message);
        messageInput.value = '';
    } else {
        append(message, 'You', 'right');
        socket.emit('send', message)
        messageInput.value = '';
    }
    // console.log(message);

});




socket.on('user-joined', (name) => {
    append(`${name} Joined the chat  - ${getCurrentTime()}`, null, 'center');
})

socket.on('receive', (data) => {
    append(data.message, data.name, 'left')
})

socket.on('users', (data) => {
    let users = data.users;
    let message =[];
    users.forEach(ele=>{
        message.push(Object.values(ele)[0])
    })
    append("Users online - "+JSON.stringify(message),null,'center');
    
});

socket.on('userDisconnect', (data) => {
    append("User disconnected - "+data.name,null,'center');
    
});



