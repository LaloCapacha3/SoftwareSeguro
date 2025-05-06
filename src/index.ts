import express, { Application } from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { engine } from 'express-handlebars';
import routes from './routes'; 
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import { registerHelpers } from './middlewares/handlebars.config';
import socketIo from 'socket.io';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Handlebars from 'handlebars';
import methodOverride from 'method-override';
import flash from 'connect-flash';



Handlebars.registerHelper('eq', function (a, b, options) {
  return (a && b && a.toString() === b.toString()) ? "selected" : "";
});


registerHelpers();

dotenv.config();

const swaggerConfig = require('./../swagger.config.json');
const swaggerDocs = swaggerJsDoc(swaggerConfig);

const app: Application = express();


app.use(
  session({
    secret: process.env.SECRET_KEY, 
    resave: true,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production' 
    }, 
  })
);
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});
app.use(methodOverride('_method'));




// Conexión a MongoDB
mongoose
  .connect(process.env.DB_URL!)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((err) => console.error('Error conectando a MongoDB', err));

// Configuración de Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos
app.use('/public', express.static(path.join(__dirname, '../../public')));

console.log("Path to layouts:", path.join(__dirname, 'views/layouts'));
console.log("Path to views:", path.join(__dirname, '../views'));
console.log("Actual __dirname:", __dirname);
console.log("Ruta completa de las vistas:", app.get('views'));
console.log("Serving static files from: ", path.join(__dirname, '../../public'));





// Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Middlewares para parsear el cuerpo de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use(routes);

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');
  
  socket.on('joinRoom', ({ username, room }) => {
    socket.join(room);
    socket.data.username = username;
    socket.data.room = room; 
    console.log(`${username} joined the chat in room ${room}`);
    socket.to(room).emit('userJoined', { user: username }); 
  });

  socket.on('newPrivateUser', ({ user }: { user: string }) => {
    socket.data.username = user;
    console.log(`${user} se ha conectado al chat privado`);
  });

  socket.on('joinPrivateRoom', () => {
    const privateRoomName = "privateChatRoom";
    const room = io.sockets.adapter.rooms.get(privateRoomName);

    console.log(`${socket.data.username} intentando unirse a la sala ${privateRoomName}`);

    if (!room || room.size < 2) {
        socket.join(privateRoomName);
        socket.data.room = privateRoomName;
        console.log(`${socket.data.username} se ha unido a ${privateRoomName}, total en sala: ${room ? room.size : 1}`);

        if (room && room.size === 2) {
            console.log(`La sala ${privateRoomName} ahora está llena.`);
            io.to(privateRoomName).emit('privateRoomFull', privateRoomName);
        }
    } else {
        console.log(`La sala ${privateRoomName} está llena. Usuario ${socket.data.username} rechazado.`);
        socket.emit('privateRoomFull', "La sala está llena");
    }
  });

  socket.on('sendPrivateMessage', ({ user, message }: { user: string, message: string }) => {
    const roomName = socket.data.room; 

    if (roomName) {
        console.log(`Mensaje de ${user} en ${roomName}: ${message}`);
        io.to(roomName).emit('privateMessageReceived', { user: user, message }); 
    } else {
        console.log(`Error: ${user} no está en ninguna sala al intentar enviar un mensaje en el chat privado`);
    }
  });

  socket.on('newMessage', ({ room, message }) => {
    if (socket.data.username) {
      console.log(`Mensaje de ${socket.data.username} en el cuarto ${room}: ${message}`);
      io.to(room).emit('newMessage', { user: socket.data.username, message });
    }
  });

  socket.on('disconnect', () => {
    const username = socket.data.username;
    const room = socket.data.room;
    if (username && room) {
      console.log(`${username} desconectado del cuarto ${room}`);
      socket.to(room).emit('userLeft', { user: username });
      socket.leave(room);
    } else {
      console.log('Usuario desconectado');
    }
  });

  socket.on('disconnectFromChat', () => {
    if (socket.data.username && socket.data.room) {
      console.log(`${socket.data.username} se ha desconectado del chat privado ${socket.data.room}`);
      io.to(socket.data.room).emit('privateUserLeft', { user: socket.data.username });
      socket.leave(socket.data.room);
    }
  });
  
});