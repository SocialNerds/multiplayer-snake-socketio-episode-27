const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const uuidv1 = require('uuid/v1');
const step = 10;
const gridNumber = 600 / step;

let games = {};
let foods = {};

// The number of positions a food item may appear.
let snakes = [];
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Create new game.
app.get('/', function(req, res){
  const token = uuidv1();
  games[token] = [];
  foods[token] = createFood();
  res.render('index', {token});
});

// Join existing game.
app.get('/:id', (req, res) => {
  const token = req.params.id;
  if (token in games) {
    res.render('index', {token});
  } else {
    res.redirect('/');
  }
})

// Generate food in new random position.
function createFood() {
  return {
    x: Math.floor(Math.random() * gridNumber) * step,
    y: Math.floor(Math.random() * gridNumber) * step
  };
}

// Start a socket connection.
io.on('connection', (socket) => {

  // Initialize game.
  socket.on('init', (data => {
    // Join room.
    socket.join(data.room);
    socket.broadcast.to(data.room).emit('join', socket.id);
    io.sockets.connected[socket.id].emit('init', {snakes: games[data.room]});
    io.sockets.connected[socket.id].emit('food', foods[data.room]);
    games[data.room].push({id: socket.id});
  }))

  // Sync player position and state.
  socket.on('sync', (data) => {
    if (typeof games[Object.keys(socket.rooms)[1]] != 'undefined') {
      games[Object.keys(socket.rooms)[1]].forEach(snake => {
        snake.direction = data.d;
        snake.x = data.x;
        snake.y = data.y;
        snake.q = data.queue;
      });
    }
  });

  // Player captured food.
  socket.on('capture', (data) => {
    if (typeof games[Object.keys(socket.rooms)[1]] != 'undefined') {
      games[Object.keys(socket.rooms)[1]].forEach(snake => {
        if (snake.id == socket.id) {
          snake.q.push(data);
          const newFood = createFood();
          foods[Object.keys(socket.rooms)[1]] = newFood;
          io.sockets.in(Object.keys(socket.rooms)[1]).emit('new-food',
            {food: newFood, snake: {id: snake.id, q: data}
          });
        }
      });
    }
  });

  // You suck. Player crashed.
  socket.on('crash', (data) => {
    snakes = snakes.filter(snake =>  snake.id !== socket.id);
    socket.broadcast.emit('dc', {id: socket.id})
  })

  // Player changed direction.
  socket.on('direction', (data) => {
    socket.broadcast.emit('direction', {direction: data.direction, id: socket.id})
  });

  // Player disconnected.
  socket.on('disconnect', () => {
    snakes = snakes.filter(snake =>  snake.id !== socket.id);
    socket.broadcast.emit('dc', {id: socket.id})
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
