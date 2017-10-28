/**
 * Snake class.
 *
 * @param id
 *  Snake id.
 * @param x
 *  Snake x position.
 * @param y
 *  Snake y position.
 * @param d
 *  Snake destination.
 * @param q
 *  Snake q array.
 */
function Snake (id = 0, x = 0, y = 0, d = 0, q = []) {
  this.id = id;
  this.x = x;
  this.y = y;

  this.queue = q;

  // 1, 2, 3, 4.
  this.direction = d;
}

/**
 * Capture a food.
 *
 * @param x
 *  Food x.
 * @param y
 *  Food y.
 *
 * @return {boolean}
 */
Snake.prototype.capture = function (x, y) {
  return dist(this.x, this.y, x, y) < 1
}

/**
 *Add a new item at the top of the queue.
 */
Snake.prototype.expand = function (x, y) {
  this.queue.push({x, y})
}

/**
 * Rearrange queue.
 */
Snake.prototype.moveQueue = function () {
  this.queue.push({x: this.x, y: this.y})
  this.queue.shift()
}

/**
 * Check if snake crashes to its tail.
 * @return {boolean}
 */
Snake.prototype.crash = function () {
  for (i = 0; i < this.queue.length; i++) {
    if (dist(this.x, this.y, this.queue[i].x, this.queue[i].y) < 1) {
      return true
    }
  }
}

/**
 * Move snake.
 */
Snake.prototype.move = function () {
  if (this.direction == 1) {
    if (this.y < 0) {
      this.y = 600
    }
    else {
      this.y -= step
    }
  }
  else if (this.direction == 2) {
    if (this.x > 600) {
      this.x = 0
    }
    else {
      this.x += step
    }
  }
  else if (this.direction == 3) {
    if (this.y > 600) {
      this.y = 0
    }
    else {
      this.y += step
    }
  }
  else if (this.direction == 4) {
    if (this.x < 0) {
      this.x = 600
    }
    else {
      this.x -= step
    }
  }
}

/**
 * Draw the snake.
 */
Snake.prototype.draw = function() {
  rect(this.x, this.y, step, step)

  // Draw queue;
  this.queue.forEach(function (position) {
    rect(position.x, position.y, step, step)
  });
}
