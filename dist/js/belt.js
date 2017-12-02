class Belt extends GameObject {
  // Use -1 for left and 1 for right
  set direction(value) {
    this._direction = value;
  }
  get speed() {
    return this._speed;
  }
  set speed(value) {
    this._speed = value;
  }
  constructor() {
    super();
    this._speed = 25; // px/second
    this.direction = 1; // default rightward
    this._sprite = game.add.tileSprite(this.x, this.y, 800, 100, 'belt');
  }
  update(delta) {
    super.update(delta);
    this.sprite.tilePosition.x += this._direction * this.speed * delta;
  }
}
