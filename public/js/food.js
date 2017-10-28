/**
 * Food class.
 */
function Food () {

    this.x = -1000;
    this.y = -1000;
}

Food.prototype.create = function (x, y) {
  this.x = x;
  this.y = y;
}

Food.prototype.draw = function () {
  fill(255, 0, 0);
  rect(this.x, this.y, step, step);
}
