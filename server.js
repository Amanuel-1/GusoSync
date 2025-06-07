const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000; // Use port 3001 as 3000 might be in use
// when using a custom server, we need to define the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      // Handle Next.js requests
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request', err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create the Socket.io server and attach it to the http server
  const io = new Server(httpServer, {
    path: '/api/socket_io', // Match the path used in the frontend
    addTrailingSlash: false,
    cors: {
      origin: '*', // Or specify your frontend origin
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle joining a room (driver-specific chat)
    socket.on('joinRoom', (room) => {
      console.log(`Socket ${socket.id} joining room: ${room}`);
      socket.join(room);
    });

    // Handle leaving a room
    socket.on('leaveRoom', (room) => {
      console.log(`Socket ${socket.id} leaving room: ${room}`);
      socket.leave(room);
    });

    // Handle sending a message to a specific room
    socket.on('sendMessageToRoom', (data) => {
      console.log(`Message to room ${data.room}: ${data.message} from ${data.senderType}`);
      // Emit the message to clients in the specified room, including senderType
      io.to(data.room).emit('roomMessage', data);
    });

    // Keep the generic message handler for now, though it might become obsolete
    socket.on('message', (msg) => {
      console.log('generic message: ' + msg);
      // This will still broadcast to all, consider if needed
      // io.emit('message', msg);
    });


    socket.on('disconnect', () => {
      console.log('user disconnected');
      // Note: Socket.IO automatically handles leaving rooms on disconnect
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
