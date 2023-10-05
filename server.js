// const io = require('socket.io')(8000);
var PORT = process.env.PORT || 3000; // take port from heroku or for loacalhost
var express = require("express");
var app = express(); // express app which is used boilerplate for HTTP
var http = require("http").Server(app);
var io = require("socket.io")(http);
const cors = require('cors');
const users = [];
app.use(express.static(__dirname + '/public'));

// app.get('/land',function(req,res){
//     res.sendFile(__dirname+'/landing.html');
// })
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

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
// function getUser(socketId){
//     users.forEach((ele)=>{
//         if(ele.id === socketId ){
//             // console.log(ele);
//             return JSON.stringify(ele);
//         }
//     })
// }
// const corsOptions = {
//     origin: '*',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true,
// };

// io.use(cors(corsOptions));
io.on('connection', (socket) => {
    socket.on('new-user-joined', (name) => {
        // console.log("name- " + name);
        let user = {};
        user[socket.id] = name;
        user['id'] = socket.id;
        user.joinTime = getCurrentTime();
        users.push(user);
        // console.log(users);
        socket.broadcast.emit('user-joined', name);
    });


    socket.on('send', (message) => {
        let user;
        users.forEach((ele) => {
            if (ele.id === socket.id) {
                // console.log(ele);
                user = ele;
            }
        })
        // console.log(user);
        socket.broadcast.emit('receive', { users: users, message: message, name: user[socket.id] })
    })

    socket.on('displayUsers', (message) => {
        let user;
        users.forEach((ele) => {
            if (ele.id === socket.id) {
                // console.log(ele);
                user = ele;
            }
        })
        // console.log(user);
        socket.emit('users', { users: users, message: JSON.stringify(users), name: user[socket.id] })
    });

    socket.on('disconnect', () => {
        if (users.length !== 0) {
            let user;
            users.forEach((ele) => {
                if (ele.id === socket.id) {
                    // console.log(ele);
                    user = ele;
                }
            })
            // console.log('disconnected' + user[socket.id]);
            io.emit('userDisconnect', { users: users, message: JSON.stringify(users), name: user[socket.id] })
        }
    })

    // socket.on('disconnect', () => {
    //     console.log('A user disconnected.');
    
    //     // Notify other users about the disconnection
    //     io.emit('user-disconnected', 'A user has left the chat.');
    //   });


});

http.listen(PORT, function () {
    console.log("server started");
});
