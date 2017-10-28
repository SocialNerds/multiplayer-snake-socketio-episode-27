let mySnake, myFood
const step = 10
const socket = io()
const UP = 1, RIGHT = 2, DOWN = 3, LEFT = 4;
let snakes = []

function setup () {
  const token = document.getElementById('token').innerHTML

  // Request to initialize game.
  socket.emit('init', {room: token})

  // Initial game data.
  socket.on('init', (data) => {
    snakes = data.snakes.map(data => {
      return new Snake(data.id, data.x, data.y, data.direction, data.q);
    })
  });

  // Another player joined the room.
  socket.on('join', (id) => {
    snakes.push(new Snake(id))
  });

  // A player changed direction.
  socket.on('direction', (data) => snakes = snakes.map(snake => {
    if (snake.id == data.id) {
      snake.direction = data.direction
    }
    return snake;
  }));

  // New food object generated.
  socket.on('food', (cordinates) => {
    myFood.create(cordinates.x, cordinates.y)
    myFood.draw();
  })

  // Player disconnected.
  socket.on('dc', data => {
    snakes = snakes.filter(snake => snake.id !== data.id)
  });

  // A player captured food, create new and feed the player.
  socket.on('new-food', (data) => {
    myFood.create(data.food.x, data.food.y);
    snakes.forEach(snake => {
      if (snake.id == data.snake.id) {
        snake.expand(data.snake.q.x, data.snake.q.y);
      }
    })
  });

  createCanvas(600, 600);

  // Set slower frame rate.
  frameRate(20);
  // Create the starting food object.
  myFood = new Food();
  // Create the main snake object.
  mySnake = new Snake();
}

function draw () {
  // Set background.
  background(0);
  snakes.forEach(snake => {
    snake.move();
    fill(0, 0, 255)
    snake.draw();
    snake.moveQueue()
  })

  // Move and draw snake.
  mySnake.move();

  // Redraw sceen.
   fill(255);
  mySnake.draw();

  // Lost bitch!
  if (mySnake.crash()) {
    textSize(60);
    fill(255, 0, 0);
    textAlign(CENTER);
    text('You suck!', 300, 300);
    frameRate(0);
    socket.emit('crash');
  }

  // Check capture.
  if (mySnake.capture(myFood.x, myFood.y)) {
    mySnake.expand(myFood.x, myFood.y);
    myFood.x = -1000;
    myFood.y = -1000;
    socket.emit('capture', {x: myFood.x, y: myFood.y});
    myFood.draw();
  }

  // Redraw queue.
  mySnake.moveQueue();
  myFood.draw();
}

/**
 * Select direction.
 */
function keyPressed () {
  if (keyCode == UP_ARROW && mySnake.direction != DOWN) {
    mySnake.direction = UP;
  }
  else if (keyCode == RIGHT_ARROW && mySnake.direction != LEFT) {
    mySnake.direction = RIGHT;
  }
  else if (keyCode == DOWN_ARROW && mySnake.direction != UP) {
    mySnake.direction = DOWN;
  }
  else if (keyCode == LEFT_ARROW && mySnake.direction != RIGHT) {
    mySnake.direction = LEFT;
  }

  socket.emit('direction', {direction: mySnake.direction});
}

setInterval(() => {
  socket.emit('sync', {x: mySnake.x, y: mySnake.y, d: mySnake.direction, queue: mySnake.queue});
}, 100);
